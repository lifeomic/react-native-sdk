import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { RefreshResult } from 'react-native-app-auth';
import { SecureStore } from '../common/SecureStore';
import { useCurrentAppState } from './useCurrentAppState';

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  authResult?: AuthResult;
  storeAuthResult: (authResult: AuthResult) => Promise<void>;
  clearAuthResult: () => Promise<void>;
  initialize: (refreshHandler: RefreshHandler) => Promise<void>;

  // We keep these methods explicitly named because we want it to feel wrong
  // for hook consumers to refresh the auth token for any other reason than
  // these named cases.  This also allows for each case to evolve on its own.
  refreshForAuthFailure: (error: Error) => Promise<void>;
  refreshForInviteAccept: () => Promise<void>;
}

export type AuthResult = Omit<RefreshResult, 'additionalParameters'>;
export type RefreshHandler = (authResult: AuthResult) => Promise<RefreshResult>;

const AuthContext = createContext<AuthStatus>({
  loading: true,
  isLoggedIn: false,
  storeAuthResult: (_) => Promise.reject(),
  clearAuthResult: () => Promise.reject(),
  initialize: (_) => Promise.reject(),
  refreshForAuthFailure: (_) => Promise.reject(),
  refreshForInviteAccept: () => Promise.reject(),
});

const secureStorage = new SecureStore<AuthResult>('auth-hook');

export function shouldAttemptTokenRefresh(
  expirationDate: string | number | Date | undefined,
) {
  if (!expirationDate) {
    return false;
  }

  const fifteenMinInMs = 15 * 60 * 1000;
  const nowMs = new Date().getTime();
  const expirationMs = new Date(expirationDate).getTime();
  return expirationMs < nowMs + fifteenMinInMs;
}

/**
 * The AuthContextProvider is primarily focused on secure auth token storage.
 * Being the gatekeeper on that auth token/result, it also centralizes state
 * about loading or refreshing (e.g. `loading` and `isLoggedIn`).
 */
export const AuthContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [authResult, setAuthResult] = useState<AuthResult>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshHandler, setRefreshHandler] = useState<
    RefreshHandler | undefined
  >();
  const { currentAppState } = useCurrentAppState();

  const storeAuthResult = useCallback(async (result: AuthResult) => {
    await secureStorage.setObject(result);
    setAuthResult(result);
    setIsLoggedIn(true);
    setLoading(false);
  }, []);

  const clearAuthResult = useCallback(async () => {
    await secureStorage.clear();
    setAuthResult(undefined);
    setIsLoggedIn(false);
    setLoading(false);
  }, []);

  const refreshAuthResult = useCallback(
    async (_refreshHandler: RefreshHandler, _authResult: AuthResult) => {
      if (__DEV__ && process.env.NODE_ENV !== 'test') {
        console.warn('Attempting access token refresh');
      }
      try {
        setLoading(true);
        const refreshResult = await _refreshHandler(_authResult);
        await storeAuthResult({
          ...refreshResult,

          // Careful not to lose `refreshToken`, which may not be in `refreshResult`
          refreshToken: refreshResult.refreshToken || _authResult.refreshToken,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn('Error occurred refreshing access token', error);
        }
        clearAuthResult();
      }
    },
    [storeAuthResult, clearAuthResult],
  );

  const initialize = useCallback(
    async (_refreshHandler: RefreshHandler) => {
      setRefreshHandler(() => _refreshHandler);
      try {
        const storedResult = await secureStorage.getObject();
        if (storedResult) {
          if (
            shouldAttemptTokenRefresh(storedResult.accessTokenExpirationDate)
          ) {
            await refreshAuthResult(_refreshHandler, storedResult);
          } else {
            setAuthResult(storedResult);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn(
            error,
            'Error occurred loading or refreshing auth token',
          );
        }
      }
      setLoading(false);
    },
    [refreshAuthResult],
  );

  const refreshIfNeeded = useCallback(
    async (skipExpirationCheck: boolean = false) => {
      if (
        !loading &&
        refreshHandler &&
        authResult &&
        (skipExpirationCheck ||
          shouldAttemptTokenRefresh(authResult.accessTokenExpirationDate))
      ) {
        return refreshAuthResult(refreshHandler, authResult);
      }
    },
    [loading, refreshHandler, authResult, refreshAuthResult],
  );

  useEffect(() => {
    if (currentAppState === 'active') {
      refreshIfNeeded();
    }
  }, [currentAppState, refreshIfNeeded]);

  const refreshForAuthFailure = useCallback(async () => {
    // TODO: Add throttling, etc.
    return refreshIfNeeded(true);
  }, [refreshIfNeeded]);

  const refreshForInviteAccept = useCallback(async () => {
    return refreshIfNeeded(true);
  }, [refreshIfNeeded]);

  const context = {
    loading,
    isLoggedIn,
    authResult,
    storeAuthResult,
    clearAuthResult,
    initialize,
    refreshForAuthFailure,
    refreshForInviteAccept,
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

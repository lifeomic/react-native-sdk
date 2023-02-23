import React, { createContext, useCallback, useContext, useState } from 'react';
import { RefreshResult } from 'react-native-app-auth';
import { SecureStore } from '../common/SecureStore';

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  authResult?: AuthResult;
  storeAuthResult: (authResult: AuthResult) => Promise<void>;
  clearAuthResult: () => Promise<void>;
  initialize: (refreshHandler: RefreshHandler) => Promise<void>;
}

export type AuthResult = Omit<RefreshResult, 'additionalParameters'>;
export type RefreshHandler = (authResult: AuthResult) => Promise<RefreshResult>;

const AuthContext = createContext<AuthStatus>({
  loading: true,
  isLoggedIn: false,
  storeAuthResult: (_) => Promise.reject(),
  clearAuthResult: () => Promise.reject(),
  initialize: (_) => Promise.reject(),
});

const secureStorage = new SecureStore<AuthResult>('auth-hook');

export function shouldAttemptTokenRefresh(
  expirationDate: string | number | Date,
) {
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

  // TODO: rename to refreshHandler and use (if needed) in appState changes
  const [__refreshHandler, setRefreshHandler] = useState<
    RefreshHandler | undefined
  >();

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

  const initialize = useCallback(
    async (_refreshHandler: RefreshHandler) => {
      setRefreshHandler(() => _refreshHandler);
      try {
        const storedResult = await secureStorage.getObject();
        if (storedResult) {
          if (
            shouldAttemptTokenRefresh(storedResult.accessTokenExpirationDate) &&
            _refreshHandler &&
            storedResult?.refreshToken
          ) {
            const refreshedResult = await _refreshHandler(storedResult);
            await storeAuthResult({
              ...refreshedResult,

              // Careful not to lose `refreshToken`, which may not be in `refreshedResult`
              refreshToken:
                refreshedResult.refreshToken ?? storedResult?.refreshToken,
            });
          } else {
            setAuthResult(storedResult);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.warn(error, 'Error occurred loading or refreshing auth token');
      }
      setLoading(false);
    },
    [storeAuthResult],
  );

  const context = {
    loading,
    isLoggedIn,
    authResult,
    storeAuthResult,
    clearAuthResult,
    initialize,
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

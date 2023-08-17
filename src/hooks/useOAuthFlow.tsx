import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {
  authorize,
  AuthConfiguration,
  // AuthorizeResult,
  refresh,
  revoke,
} from 'react-native-app-auth';
import { AuthResult, useAuth } from './useAuth';
import { usePendingInvite } from './usePendingInvite';
import { useQueryClient } from 'react-query';

// Should we re-use the `AuthorizeResult` type exported from `'react-native-app-auth'` as a dev/type dep
// import type { AuthorizeResult } from 'react-native-app-auth';
// type ProvidedAuthorizeResult = AuthorizeResult;
export type ProvidedAuthorizeResult = {
  accessToken: string;
  accessTokenExpirationDate: string;
  idToken: string;
  refreshToken: string;
  tokenType: string;
};

type ProvidedAuthorize = () => Promise<ProvidedAuthorizeResult>;

export interface OAuthConfig {
  login: (params: LoginParams) => Promise<void>;
  logout: (params: LogoutParams) => Promise<void>;
  authConfig?: AuthConfiguration;
}

export interface LoginParams {
  onSuccess?: (result: ProvidedAuthorizeResult) => void;
  onFail?: (error?: any) => void;
}

export interface LogoutParams {
  onSuccess?: () => void;
  onFail?: (error?: any) => void;
}

const OAuthContext = createContext<OAuthConfig>({
  login: (_) => Promise.reject(),
  logout: () => Promise.reject(),
});

export const OAuthContextProvider = ({
  authConfig,
  children,
  providedAuthorize = () => authorize(authConfig),
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
  providedAuthorize?: ProvidedAuthorize;
}) => {
  const {
    isLoggedIn,
    initialize,
    authResult,
    storeAuthResult,
    clearAuthResult,
  } = useAuth();

  const {
    inviteParams: { inviteId, evc },
  } = usePendingInvite();
  const queryClient = useQueryClient();

  // PKCE is required
  if (!authConfig.usePKCE) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('NOTE: LifeOmic requires PKCE. Overriding to usePKCE=true');
    }
    authConfig.usePKCE = true;
  }

  // Ephemeral session is required
  if (!authConfig.iosPrefersEphemeralSession) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        'NOTE: LifeOmic requires iosPrefersEphemeralSession. Overriding to iosPrefersEphemeralSession=true',
      );
    }
    authConfig.iosPrefersEphemeralSession = true;
  }

  if (inviteId && evc) {
    authConfig.additionalParameters = {
      ...authConfig.additionalParameters,
      inviteId,
      evc,
    };
    console.warn({ inviteId }, 'Added invite params to authConfig');
  }

  const logout = useCallback(
    async (params: LogoutParams) => {
      const { onSuccess, onFail } = params;

      // Clear cached query results on logout
      // to support switching user accounts
      queryClient.clear();
      if (!isLoggedIn || !authResult?.refreshToken) {
        await clearAuthResult();
        onSuccess?.();
        return;
      }

      try {
        await revoke(authConfig, {
          tokenToRevoke: authResult.refreshToken,
          sendClientId: true,
        });
        await clearAuthResult();
        onSuccess?.();
      } catch (error) {
        await clearAuthResult();
        onFail?.(error);
      }
    },
    [
      queryClient,
      isLoggedIn,
      authResult?.refreshToken,
      clearAuthResult,
      authConfig,
    ],
  );

  const login = useCallback(
    async (params: LoginParams) => {
      const { onSuccess, onFail } = params;

      try {
        const result = await providedAuthorize();
        await storeAuthResult(result);

        onSuccess?.(result);
      } catch (error) {
        await clearAuthResult();
        onFail?.(error);
      }
    },
    [clearAuthResult, storeAuthResult, providedAuthorize],
  );

  const refreshHandler = useCallback(
    async function (storedResult: AuthResult) {
      if (!storedResult?.refreshToken) {
        throw new Error(
          'No refreshToken! The app can NOT function properly without a refreshToken. Expect to be logged out immediately.',
        );
      }
      return await refresh(authConfig, {
        refreshToken: storedResult.refreshToken,
      });
    },
    [authConfig],
  );

  useEffect(() => {
    if (authConfig && refreshHandler) {
      initialize(refreshHandler);
    }
  }, [initialize, refreshHandler, authConfig]);

  const context = {
    login,
    logout,
    authConfig,
  };

  return (
    <OAuthContext.Provider value={context}>{children}</OAuthContext.Provider>
  );
};

export const useOAuthFlow = () => useContext(OAuthContext);

import React, { createContext, useCallback, useContext } from 'react';
import {
  authorize,
  AuthConfiguration,
  AuthorizeResult,
  revoke,
} from 'react-native-app-auth';
import { useAuth } from './useAuth';

export interface OAuthConfig {
  login: (params: LoginParams) => Promise<void>;
  logout: (params: LogoutParams) => Promise<void>;
  authConfig?: AuthConfiguration;
}

export interface LoginParams {
  onSuccess: (result: AuthorizeResult) => void;
  onFail: (error?: any) => void;
}

export interface LogoutParams {
  onSuccess: () => void;
  onFail: (error?: any) => void;
}

const OAuthContext = createContext<OAuthConfig>({
  login: (_) => Promise.reject(),
  logout: () => Promise.reject(),
});

export const OAuthContextProvider = ({
  authConfig,
  children,
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
}) => {
  const { isLoggedIn, authResult, storeAuthResult, clearAuthResult } =
    useAuth();

  // PKCE is required
  if (!authConfig.usePKCE) {
    console.warn('NOTE: LifeOmic requires PKCE. Overriding to usePKCE=true');
    authConfig.usePKCE = true;
  }

  const logout = useCallback(
    async (params: LogoutParams) => {
      const { onSuccess, onFail } = params;
      if (!isLoggedIn || !authResult?.refreshToken) {
        onSuccess();
        return;
      }

      try {
        await revoke(authConfig, {
          tokenToRevoke: authResult.refreshToken,
        });
        await clearAuthResult();
        onSuccess();
      } catch (error) {
        await clearAuthResult();
        onFail(error);
      }
    },
    [isLoggedIn, authConfig, authResult, clearAuthResult],
  );

  const login = useCallback(
    async (params: LoginParams) => {
      const { onSuccess, onFail } = params;

      try {
        const result = await authorize(authConfig);
        await storeAuthResult(result);
        onSuccess(result);
      } catch (error) {
        await clearAuthResult();
        onFail(error);
      }
    },
    [authConfig, clearAuthResult, storeAuthResult],
  );

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

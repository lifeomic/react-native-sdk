import React, { createContext, useCallback, useContext } from 'react';
import {
  authorize,
  AuthConfiguration,
  AuthorizeResult,
  EndSessionResult,
  logout,
  LogoutConfiguration
} from 'react-native-app-auth';

export interface OAuthConfig {
  login: (params: LoginParams) => Promise<void>;
  logout: (params: LogoutParams) => Promise<void>;
  authConfig?: AuthConfiguration;
}

export interface LoginParams {
  onSuccess: (result: AuthorizeResult) => void;
  onFail: (error?: any) => void;
}

export interface LogoutParams extends LogoutConfiguration {
  onSuccess: (result: EndSessionResult) => void;
  onFail: (error?: any) => void;
}

const OAuthContext = createContext<OAuthConfig>({
  login: (_) => Promise.reject(),
  logout: () => Promise.reject()
});

export const OAuthContextProvider = ({
  authConfig,
  children
}: {
  authConfig: AuthConfiguration;
  children?: React.ReactNode;
}) => {
  // PKCE is required
  if (!authConfig.usePKCE) {
    console.warn('NOTE: LifeOmic requires PKCE. Overriding to usePKCE=true');
    authConfig.usePKCE = true;
  }

  const initiateLogout = useCallback(
    async (params: LogoutParams) => {
      const { idToken, postLogoutRedirectUrl, onSuccess, onFail } = params;

      try {
        const result = await logout(authConfig, {
          idToken,
          postLogoutRedirectUrl
        });
        onSuccess(result);
      } catch (error) {
        onFail(error);
      }
    },
    [authConfig]
  );

  const login = useCallback(
    async (params: LoginParams) => {
      const { onSuccess, onFail } = params;

      try {
        const result = await authorize(authConfig);
        onSuccess(result);
      } catch (error) {
        onFail(error);
      }
    },
    [authConfig]
  );

  const context = {
    login,
    logout: initiateLogout,
    authConfig
  };

  return (
    <OAuthContext.Provider value={context}>{children}</OAuthContext.Provider>
  );
};

export const useOAuthFlow = () => useContext(OAuthContext);

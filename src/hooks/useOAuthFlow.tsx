import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import {
  authorize,
  AuthConfiguration,
  AuthorizeResult,
  refresh,
  revoke,
} from 'react-native-app-auth';
import { AuthResult, useAuth } from './useAuth';
import { usePendingInvite } from '../components/Invitations/InviteProvider';
import { useQueryClient } from '@tanstack/react-query';
import { _sdkAnalyticsEvent } from '../common/Analytics';
import { useDeveloperConfig } from './useDeveloperConfig';
import { useStoredValue } from './useStoredValue';

export interface OAuthConfig {
  login: (params: LoginParams) => Promise<void>;
  logout: (params: LogoutParams) => Promise<void>;
  authConfig?: AuthConfiguration;
}

export interface LoginParams {
  onSuccess?: (result: AuthorizeResult) => void;
  onFail?: (error?: any) => void;
}

export interface LogoutParams {
  onSuccess?: () => void;
  onFail?: (error?: any) => void;
}

/**
 * Callback function to set the authentication configuration used during
 * OAuth flows.
 *
 * While typically not needed, this function is invoked with the current
 * access token to be able to provide a dynamic auth configuration.
 *
 * @example
 * <RootProviders
 *   authConfig={(currentAccessToken) => {
 *     if (...) {
 *       return {
 *         ...config,
 *         // make auth config change
 *       }
 *     }
 *     return config
 *   }}
 * />
 */
export type AuthConfigGetter = (accessToken?: string) => AuthConfiguration;

const OAuthContext = createContext<OAuthConfig>({
  login: (_) => Promise.reject(),
  logout: () => Promise.reject(),
});

export const OAuthContextProvider = ({
  authConfig: authConfigOrGetter,
  children,
}: {
  authConfig: AuthConfiguration | AuthConfigGetter;
  children?: React.ReactNode;
}) => {
  const {
    isLoggedIn,
    initialize,
    authResult,
    storeAuthResult,
    clearAuthResult,
  } = useAuth();
  const pendingInvite = usePendingInvite();
  const queryClient = useQueryClient();
  const { skipInviteParams } = useDeveloperConfig();
  const [_, setLoginDetected] = useStoredValue('loginDetected');

  const authConfig = useMemo(
    () =>
      typeof authConfigOrGetter === 'function'
        ? authConfigOrGetter(authResult?.accessToken)
        : authConfigOrGetter,
    [authConfigOrGetter, authResult?.accessToken],
  );

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

  if (pendingInvite?.evc && !skipInviteParams) {
    authConfig.additionalParameters = {
      ...authConfig.additionalParameters,
      inviteId: pendingInvite.inviteId,
      evc: pendingInvite.evc,
    };
    console.warn(
      { inviteId: pendingInvite.inviteId },
      'Added invite params to authConfig',
    );
  }

  const logout = useCallback(
    async (params: LogoutParams) => {
      const { onSuccess, onFail } = params;

      // Clear cached query results on logout
      // to support switching user accounts
      queryClient.clear();
      _sdkAnalyticsEvent.resetUser();
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
        const result = await authorize(authConfig);
        await storeAuthResult(result);
        setLoginDetected('detected');
        _sdkAnalyticsEvent.track('Login', { usedInvite: !!pendingInvite?.evc });
        onSuccess?.(result);
      } catch (error) {
        _sdkAnalyticsEvent.track('LoginFailure', {
          error: JSON.stringify(error),
          usedInvite: !!pendingInvite?.evc,
        });
        await clearAuthResult();
        onFail?.(error);
      }
    },
    [
      authConfig,
      clearAuthResult,
      pendingInvite?.evc,
      setLoginDetected,
      storeAuthResult,
    ],
  );

  const refreshHandler = useCallback(
    async function (storedResult: AuthResult) {
      if (!storedResult?.refreshToken) {
        _sdkAnalyticsEvent.track('TokenRefreshFailure', {
          accessTokenExpirationDate: storedResult.accessTokenExpirationDate,
        });
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

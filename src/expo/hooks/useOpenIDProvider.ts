import { useEffect, useRef } from 'react';
import {
  useAutoDiscovery,
  useAuthRequest,
  exchangeCodeAsync,
  AuthSessionResult,
  AuthRequestConfig,
} from 'expo-auth-session';
import { maybeCompleteAuthSession } from 'expo-web-browser';

maybeCompleteAuthSession();

type ServiceConfiguration = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revocationEndpoint?: string;
  registrationEndpoint?: string;
  endSessionEndpoint?: string;
};

export type AuthConfig = AuthRequestConfig & {
  issuer: string;
  serviceConfiguration: ServiceConfiguration;
};

export const useOpenIDProvider = (oauthConfig: AuthConfig) => {
  const discovery = useAutoDiscovery(oauthConfig.issuer);
  const [auth, , _prompt] = useAuthRequest(
    oauthConfig,
    discovery || oauthConfig.serviceConfiguration,
  );

  // if a code was requested it will be accessible, but only from the AuthRequest
  // by storing its value in a ref we can access it later within the `prompt` action
  // rather than reacting to its value change in an effect
  const codeVerifierRef = useRef<string>();
  useEffect(() => {
    if (auth?.codeVerifier) {
      codeVerifierRef.current = auth.codeVerifier;
    }
  });

  const prompt = async (): Promise<AuthSessionResult> => {
    const session = await _prompt();

    if (session.type === 'success' && typeof session.params.code === 'string') {
      const params = session.params as { code: string };
      const exchange = await exchangeCodeAsync(
        {
          clientId: oauthConfig.clientId,
          redirectUri: oauthConfig.redirectUri,
          code: params.code,
          clientSecret: oauthConfig.clientSecret,
          scopes: oauthConfig.scopes,
          ...(codeVerifierRef.current
            ? {
                extraParams: {
                  code_verifier: codeVerifierRef.current,
                },
              }
            : null),
        },
        discovery || oauthConfig.serviceConfiguration,
      );

      return {
        ...session,
        authentication: exchange,
      };
    }

    return session;
  };

  return prompt;
};

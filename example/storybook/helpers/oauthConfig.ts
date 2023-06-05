import { AuthConfiguration } from 'react-native-app-auth';
import { oauthConfig, apiBaseUrl } from '../../config';

export const authConfig: AuthConfiguration = {
  clientId: oauthConfig.clientId,
  redirectUrl: oauthConfig.redirectUrl,
  serviceConfiguration: {
    authorizationEndpoint: oauthConfig.authorizationEndpoint,
    tokenEndpoint: oauthConfig.tokenEndpoint,
    revocationEndpoint: oauthConfig.revokeEndpoint,
  },
  usePKCE: true,
  scopes: ['openid', 'offline_access'],
  additionalParameters: {
    prompt: 'consent',
  },
};

export const baseURL = apiBaseUrl;

export const oauthConfig = {
  clientId: '36snajbcbt8tmg2ir5r5k1rdpp',
  redirectUrl: 'com.lifeomic.mobile-example://login-callback',
  authorizationEndpoint: 'https://apps.us.lifeomic.com/oidc-provider/auth',
  tokenEndpoint: 'https://apps.us.lifeomic.com/oidc-provider/token',
  revokeEndpoint: 'https://apps.us.lifeomic.com/oidc-provider/token/revocation',
};

export const simpleTheme = {
  primaryColor: '#67595E',
};

export const apiBaseUrl = 'https://api.us.lifeomic.com';

export const applicationName = 'example';

// Change this to true to see a full demo app instead of storybook
export const useDemoApp = false;

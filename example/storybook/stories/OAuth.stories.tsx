import React, { FC } from 'react';
import { StyleProp, TextStyle, Text } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { text, object } from '@storybook/addon-knobs';
import Config from 'react-native-config';
import { AuthConfiguration, AuthorizeResult } from 'react-native-app-auth';
import { OAuthLoginButton } from '../../../src/components/OAuthLoginButton';
import { OAuthLogoutButton } from '../../../src/components/OAuthLogoutButton';
import { OAuthContextProvider } from '../../../src/hooks/useOAuthFlow';
import { AuthContextProvider, useAuth } from '../../../src/hooks/useAuth';

export const authConfig: AuthConfiguration = {
  clientId: Config.OAUTH_CLIENT_ID!,
  redirectUrl: Config.OAUTH_REDIRECT_URL!,
  serviceConfiguration: {
    authorizationEndpoint: Config.OAUTH_AUTHORIZATION_ENDPOINT!,
    tokenEndpoint: Config.OAUTH_TOKEN_ENDPOINT!,
    revocationEndpoint: Config.OAUTH_REVOKE_ENDPOINT!,
  },
  scopes: ['openid'],
  usePKCE: true,
};

storiesOf('OAuth', module).add('demo', () => {
  // Actions:
  const loginOnSuccess = (result: AuthorizeResult) => {
    action('login - onSuccess')({
      tokenType: result.tokenType,
      accessTokenExpirationDate: result.accessTokenExpirationDate,
    });
  };
  const logoutOnSuccess = action('logout - onSuccess');
  const onFail = action('onFail');

  // Knobs:
  const buttonStyle = object('buttonStyle', {
    width: '100%',
    height: 40,
    backgroundColor: '#e3e3e3',
    marginTop: 40,
    paddingTop: 10,
  });
  const textStyle = object('textStyle', {
    textAlign: 'center',
  }) as StyleProp<TextStyle>;
  const loginButtonText = text('loginButtonText', 'Login');
  const logoutButtonText = text('logoutButtonText', 'Logout');

  return (
    <AuthContextProvider>
      <IsSignedIn />
      <OAuthContextProvider authConfig={authConfig}>
        <OAuthLoginButton
          onSuccess={loginOnSuccess}
          onFail={onFail}
          style={buttonStyle}
          label={loginButtonText}
        />
        <OAuthLogoutButton
          onSuccess={logoutOnSuccess}
          onFail={onFail}
          style={buttonStyle}
        >
          <Text style={textStyle}>{logoutButtonText}</Text>
        </OAuthLogoutButton>
      </OAuthContextProvider>
    </AuthContextProvider>
  );
});

const IsSignedIn: FC = () => {
  const { isLoggedIn, authResult } = useAuth();
  return (
    <Text>
      {isLoggedIn
        ? `Logged in until ${authResult?.accessTokenExpirationDate}`
        : 'Logged out'}
    </Text>
  );
};

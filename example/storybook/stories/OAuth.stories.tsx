import React, { FC } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import { text, boolean, select } from '@storybook/addon-knobs';
import { AuthConfiguration, AuthorizeResult } from 'react-native-app-auth';
import { OAuthLoginButton } from '../../../src/components/OAuthLoginButton';
import { OAuthLogoutButton } from '../../../src/components/OAuthLogoutButton';
import { OAuthContextProvider } from '../../../src/hooks/useOAuthFlow';
import { AuthContextProvider, useAuth } from '../../../src/hooks/useAuth';
import { CenterView } from '../helpers/CenterView';
import { BrandConfigProvider } from '../../../src/components/BrandConfigProvider';
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

storiesOf('OAuth', module)
  .addDecorator((story) => <CenterView>{story()}</CenterView>)

  .add('demo', () => {
    // Actions:
    const loginOnSuccess = (result: AuthorizeResult) => {
      action('login - onSuccess')({
        tokenType: result.tokenType,
        accessTokenExpirationDate: result.accessTokenExpirationDate,
      });
    };
    const logoutOnSuccess = action('logout - onSuccess');
    const onFail = action('onFail');

    const buttonProps = (groupId?: string) => ({
      label: text('label', 'Login', groupId),
      mode: select(
        'mode',
        {
          text: 'text',
          outlined: 'outlined',
          contained: 'contained',
          elevated: 'elevated',
          'contained-tonal': 'contained-tonal',
        },
        'contained',
        groupId,
      ),
      compact: boolean('compact', false, groupId),
      loading: boolean('loading', false, groupId),
      disabled: boolean('disabled', false, groupId),
      uppercase: boolean('uppercase', false, groupId),
      icon: text('icon', '', groupId),
    });

    const loginButtonProps = buttonProps('Login Button');

    const logoutButtonText = text('label', 'Logout', 'Logout Button');

    const signedInWrapper: ViewStyle = {
      margin: 64,
      height: 200,
      justifyContent: 'space-between',
      alignItems: 'center',
    };

    return (
      <AuthContextProvider>
        <OAuthContextProvider authConfig={authConfig}>
          <BrandConfigProvider>
            <View style={signedInWrapper}>
              <IsSignedIn />
              <OAuthLoginButton
                onSuccess={loginOnSuccess}
                onFail={onFail}
                {...loginButtonProps}
              />
              <OAuthLogoutButton
                onSuccess={logoutOnSuccess}
                onFail={onFail}
                label={logoutButtonText}
              />
            </View>
          </BrandConfigProvider>
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

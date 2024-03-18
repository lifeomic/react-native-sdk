import React, { FC, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { t } from 'i18next';
import { OAuthLoginButton } from '../components/OAuthLoginButton';
import { useStyles, useDeveloperConfig } from '../hooks/';
import {
  usePendingInvite,
  usePendingInviteState,
} from '../components/Invitations/InviteProvider';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import LaunchScreen from '../components/LaunchScreen';
import { Dialog, Portal, Text } from 'react-native-paper';
import compact from 'lodash/compact';
import { _sdkAnalyticsEvent } from '../common/Analytics';

export const LoginScreen: FC = () => {
  const { renderCustomLoginScreen, componentProps = {} } = useDeveloperConfig();
  const { styles } = useStyles(defaultStyles);
  const [visible, setVisible] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { AlertTriangle } = useIcons();
  const pendingInvite = usePendingInvite();
  const { loading, failedToDecode, failureMessage } = usePendingInviteState();
  const { LoginScreen: loginScreenProps = {} } = componentProps;

  const hideDialog = () => {
    setVisible(false);
    setErrorText('');
  };

  const getLoginButtonText = () => {
    if (loading) {
      return t('login-button-loading-invite', 'Loading');
    }
    if (pendingInvite) {
      _sdkAnalyticsEvent.track('LoginButtonPresented', {
        buttonText: 'Accept Invite',
      });
      return (
        loginScreenProps.acceptInviteText ??
        t('login-button-title-invite-found', 'Accept Invite')
      );
    }

    _sdkAnalyticsEvent.track('LoginButtonPresented', {
      buttonText: 'Login',
    });
    return loginScreenProps.loginText ?? t('login-button-title', 'Login');
  };

  const onFail = (error: any) => {
    const errorString: string = error.toString();
    if (
      errorString.includes('User cancelled flow') ||
      errorString.includes('org.openid.appauth.general error -3') // User Cancelled Flow https://github.com/openid/AppAuth-iOS/blob/master/Source/AppAuthCore/OIDError.h#L103
    ) {
      return;
    }

    if (__DEV__) {
      setErrorText(errorString);
    } else {
      setErrorText(
        t(
          'login-error-message',
          'We encountered an error trying to log you in.',
        ),
      );
    }
    setVisible(true);
  };

  return renderCustomLoginScreen ? (
    renderCustomLoginScreen()
  ) : (
    <>
      <View style={styles.containerView}>
        <LaunchScreen key="launch-screen" style={StyleSheet.absoluteFill} />
        <View style={styles.buttonContainer}>
          <OAuthLoginButton
            label={getLoginButtonText()}
            onFail={onFail}
            loading={loading}
            disabled={loading || failedToDecode}
          />
          {failedToDecode && (
            <Text
              style={styles.inviteErrorText}
              suppressHighlighting
              onLongPress={() => {
                setVisible(true);
              }}
            >
              {t('login-invite-error', 'Invite Error Occurred')}
            </Text>
          )}
        </View>
      </View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Icon icon={AlertTriangle} />
          <Dialog.Title>
            {t('login-error-title', 'Authentication Error')}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {compact([errorText, failureMessage]).join('\n')}
            </Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
};

const defaultStyles = createStyles('LoginScreen', (theme) => ({
  containerView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonContainer: {
    height: '20%',
    width: '100%',
    paddingHorizontal: 30,
  },
  inviteErrorText: {
    color: theme.colors.error,
    textAlign: 'center',
    paddingVertical: theme.spacing.small,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type LoginScreenStyles = NamedStylesProp<typeof defaultStyles>;

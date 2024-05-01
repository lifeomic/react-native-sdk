import React, { useCallback } from 'react';

import { Button, ButtonProps } from 'react-native-paper';
import { useStyles } from '../hooks/useStyles';
import { LoginParams, useOAuthFlow } from '../hooks/useOAuthFlow';
import { tID } from '../common/testID';
import { createStyles } from './BrandConfigProvider';
import { useStoredValue } from '../hooks/useStoredValue';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { t } from 'i18next';
import { Alert } from 'react-native';
import { usePendingInvite } from './Invitations/InviteProvider';

type Props = Omit<ButtonProps, 'onPress' | 'style' | 'children'> &
  LoginParams & {
    label: string;
    style?: OAuthLoginButtonStyles;
  };

const newLoginAlert = () => {
  return new Promise<Boolean>((resolve) => {
    Alert.alert(
      t('new-login-title', 'New Login Notice'),
      t(
        'new-login-notice',
        'NOTE: This device has not yet been used to login to the app.\nIf this is your first time using this app then you must first be invited to use this app via email.',
      ),
      [
        { text: 'Proceed Anyway', onPress: () => resolve(true) },
        { text: 'Return', onPress: () => resolve(false) },
      ],
      { cancelable: false },
    );
  });
};

export function OAuthLoginButton({
  onSuccess,
  onFail,
  label,
  style: instanceStyles,
  ...buttonProps
}: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { login } = useOAuthFlow();
  const [priorLoginDetected] = useStoredValue('loginDetected');
  const { showPreLoginWarning } = useDeveloperConfig();
  const pendingInvite = usePendingInvite();

  const handleOnPress = useCallback(async () => {
    if (showPreLoginWarning && !pendingInvite && !priorLoginDetected) {
      // If attempting to login for the first time without a pending invite
      // let the user know that they are probably making a mistake
      // This can be disabled via developerConfig
      const result = await newLoginAlert();
      if (result) {
        await login({ onSuccess, onFail });
      }
    } else {
      await login({ onSuccess, onFail });
    }
  }, [
    pendingInvite,
    priorLoginDetected,
    showPreLoginWarning,
    login,
    onSuccess,
    onFail,
  ]);

  return (
    <Button
      mode="contained"
      onPress={handleOnPress}
      testID={tID('oauth-login-button')}
      style={styles.style}
      contentStyle={styles.content}
      labelStyle={styles.label}
      {...buttonProps}
    >
      {label}
    </Button>
  );
}

const defaultStyles = createStyles('OAuthLoginButton', () => ({
  style: {},
  content: {},
  label: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type OAuthLoginButtonStyles = NamedStylesProp<typeof defaultStyles>;

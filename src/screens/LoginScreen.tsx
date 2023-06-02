import React, { FC, useState } from 'react';
import { View } from 'react-native';
import { t } from 'i18next';
import { OAuthLoginButton } from '../components/OAuthLoginButton';
import { useStyles } from '../hooks/useStyles';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { Dialog, Portal, Text } from 'react-native-paper';

export const LoginScreen: FC = () => {
  const { styles } = useStyles(defaultStyles);
  const [visible, setVisible] = useState(false);
  const [errorText, setErrorText] = useState('');
  const { AlertTriangle } = useIcons();
  const hideDialog = () => {
    setVisible(false);
    setErrorText('');
  };

  const onFail = (error: any) => {
    const errorString: string = error.toString();
    if (errorString.includes('User cancelled flow')) {
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

  return (
    <>
      <View style={styles.containerView}>
        <OAuthLoginButton
          label={t('login-button-title', 'Login')}
          onFail={onFail}
        />
      </View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Icon icon={AlertTriangle} />
          <Dialog.Title>
            {t('login-error-title', 'Authentication Error')}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{errorText}</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
};

const defaultStyles = createStyles('LoginScreen', () => ({
  containerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type LoginScreenStyles = NamedStylesProp<typeof defaultStyles>;

import React, { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import { t } from 'i18next';
import { OAuthLoginButton } from '../components/OAuthLoginButton';
import { useStyles } from '../hooks/useStyles';
import { NamedStylesProp } from '../components/BrandConfigProvider/types';

export const LoginScreen: FC = () => {
  const { styles } = useStyles('LoginScreen', defaultStyles);

  return (
    <View style={styles.containerView}>
      <OAuthLoginButton label={t('login-button-title', 'Login')} />
    </View>
  );
};

const containerView: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};

const defaultStyles = {
  containerView,
};

declare module 'src/components/BrandConfigProvider/types' {
  interface ComponentStyles
    extends ComponentNamedStyles<'LoginScreen', typeof defaultStyles> {}
}

export type LoginScreenStyles = NamedStylesProp<typeof defaultStyles>;

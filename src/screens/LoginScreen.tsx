import React, { FC } from 'react';
import { View } from 'react-native';
import { t } from 'i18next';
import { OAuthLoginButton } from '../components/OAuthLoginButton';
import { useStyles } from '../hooks/useStyles';
import { createStyles } from '../components/BrandConfigProvider';

export const LoginScreen: FC = () => {
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.containerView}>
      <OAuthLoginButton label={t('login-button-title', 'Login')} />
    </View>
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

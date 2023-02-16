import React, { FC } from 'react';
import { Text } from 'react-native';
import { t } from 'i18next';
import { OAuthLoginButton } from '../components/OAuthLoginButton';

export const LoginScreen: FC = () => {
  return (
    <OAuthLoginButton>
      <Text>{t('login-button-title', 'Login')}</Text>
    </OAuthLoginButton>
  );
};

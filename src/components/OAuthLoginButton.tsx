import React, { FC, useCallback } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LoginParams, useOAuthFlow } from '../hooks/useOAuthFlow';

type OAuthLoginButtonParams = Omit<TouchableOpacityProps, 'onPress'> &
  LoginParams & {
    children?: React.ReactNode;
  };

export const OAuthLoginButton: FC<OAuthLoginButtonParams> = ({
  onSuccess,
  onFail,
  children,
  ...touchableOpacityProps
}) => {
  const { login } = useOAuthFlow();

  const _login = useCallback(async () => {
    await login({
      onSuccess,
      onFail,
    });
  }, [login, onSuccess, onFail]);

  return (
    <TouchableOpacity {...touchableOpacityProps} onPress={_login}>
      {children}
    </TouchableOpacity>
  );
};

import React, { FC, useCallback } from 'react';
import { StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { LoginParams, useOAuthFlow } from '../hooks/useOAuthFlow';

type OAuthLoginButtonParams = LoginParams & {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const OAuthLoginButton: FC<OAuthLoginButtonParams> = ({
  onSuccess,
  onFail,
  style,
  children
}) => {
  const authConfig = useOAuthFlow();

  const login = useCallback(async () => {
    await authConfig.login({
      onSuccess,
      onFail
    });
  }, [authConfig]);

  return (
    <TouchableOpacity style={style} onPress={login}>
      {children}
    </TouchableOpacity>
  );
};

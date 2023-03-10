import React, { useCallback } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { LoginParams, useOAuthFlow } from '../hooks/useOAuthFlow';
import { tID } from '../common/testID';
import { Theme } from './BrandConfigProvider';
import { Button, ButtonProps } from 'react-native-paper';

type Props = Omit<ButtonProps, 'onPress' | 'children'> &
  LoginParams & {
    label: string;
    styles?: OAuthLoginButtonStyles;
  };

export function OAuthLoginButton({
  onSuccess,
  onFail,
  label,
  styles: instanceStyles,
  ...buttonProps
}: Props) {
  const { styles } = useStyles(
    'OAuthLoginButton',
    defaultStyles,
    instanceStyles,
  );
  const { login } = useOAuthFlow();

  const handleOnPress = useCallback(async () => {
    await login({
      onSuccess,
      onFail,
    });
  }, [login, onSuccess, onFail]);

  return (
    <Button
      mode="contained"
      onPress={handleOnPress}
      testID={tID('oauth-login-button')}
      {...styles}
      {...buttonProps}
    >
      {label}
    </Button>
  );
}

const defaultStyles = (_theme: Theme) => {
  const style: ViewStyle = {};
  const contentStyle: ViewStyle = {};
  const labelStyle: TextStyle = {};

  return { style, contentStyle, labelStyle };
};

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<'OAuthLoginButton', typeof defaultStyles> {}
}

export type OAuthLoginButtonStyles = NamedStylesProp<typeof defaultStyles>;

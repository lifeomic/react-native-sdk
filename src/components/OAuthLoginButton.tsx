import React, { useCallback } from 'react';

import { Button, ButtonProps } from 'react-native-paper';
import { useStyles } from '../hooks/useStyles';
import { LoginParams, useOAuthFlow } from '../hooks/useOAuthFlow';
import { tID } from '../common/testID';
import { createStyles } from './BrandConfigProvider';

type Props = Omit<ButtonProps, 'onPress' | 'style' | 'children'> &
  LoginParams & {
    label: string;
    style?: OAuthLoginButtonStyles;
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

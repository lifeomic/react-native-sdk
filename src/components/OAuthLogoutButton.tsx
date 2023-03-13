import React, { useCallback } from 'react';

import { Button, ButtonProps } from 'react-native-paper';
import { useStyles } from '../hooks/useStyles';
import { tID } from '../common/testID';
import { useAuth } from '../hooks/useAuth';
import { LogoutParams, useOAuthFlow } from '../hooks/useOAuthFlow';
import { createStyles } from '../components/BrandConfigProvider';

type Props = Omit<ButtonProps, 'onPress' | 'style' | 'children'> &
  LogoutParams & {
    label: string;
    style?: OAuthLogoutButtonStyles;
  };

export function OAuthLogoutButton({
  onSuccess,
  onFail,
  label,
  style: instanceStyles,
  ...buttonProps
}: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { isLoggedIn } = useAuth();
  const { logout } = useOAuthFlow();

  const handleOnPress = useCallback(async () => {
    await logout({
      onSuccess,
      onFail,
    });
  }, [logout, onSuccess, onFail]);

  return (
    <Button
      mode="contained"
      onPress={handleOnPress}
      testID={tID('oauth-logout-button')}
      disabled={!isLoggedIn}
      style={styles.style}
      contentStyle={styles.content}
      labelStyle={styles.label}
      {...buttonProps}
    >
      {label}
    </Button>
  );
}

const defaultStyles = createStyles('OAuthLogoutButton', () => ({
  style: {},
  content: {},
  label: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type OAuthLogoutButtonStyles = NamedStylesProp<typeof defaultStyles>;

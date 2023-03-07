import React, { FC, useCallback } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  Text,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { tID } from '../common/testID';
import { useAuth } from '../hooks/useAuth';
import { LogoutParams, useOAuthFlow } from '../hooks/useOAuthFlow';
import { Theme } from './BrandConfigProvider/theme/Theme';

type OAuthLogoutButtonParams = Omit<TouchableOpacityProps, 'onPress'> &
  LogoutParams & {
    label: string;
    styles?: OAuthLogoutButtonStyles;
  };

export const OAuthLogoutButton: FC<OAuthLogoutButtonParams> = ({
  onSuccess,
  onFail,
  label,
  styles: instanceStyles,
  ...touchableOpacityProps
}) => {
  const { styles } = useStyles(
    'OAuthLoginButton',
    defaultStyles,
    instanceStyles,
  );
  const { isLoggedIn } = useAuth();
  const { logout } = useOAuthFlow();

  const _logout = useCallback(async () => {
    await logout({
      onSuccess,
      onFail,
    });
  }, [logout, onSuccess, onFail]);

  return (
    <View style={styles.button}>
      <TouchableOpacity
        testID={tID('oauth-logout-button')}
        {...touchableOpacityProps}
        disabled={!isLoggedIn}
        onPress={_logout}
        style={styles.touchableOpacity}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const defaultStyles = (theme: Theme) => {
  const button: ViewStyle = {
    flexDirection: 'row',
  };
  const touchableOpacity: ViewStyle = {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.buttonRoundness,

    minWidth: 64,
  };

  const content: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const label: TextStyle = {
    color: theme.colors.onSecondary,
    marginVertical: 10,
    marginHorizontal: 24,

    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      default: 'sans-serif-medium',
    }),

    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
    fontSize: 14,
  };

  return { button, touchableOpacity, content, label };
};

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<'OAuthLogoutButton', typeof defaultStyles> {}
}

export type OAuthLogoutButtonStyles = NamedStylesProp<typeof defaultStyles>;

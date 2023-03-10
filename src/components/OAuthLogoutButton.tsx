import React, { FC, useCallback } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  Text,
  Platform,
} from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { tID } from '../common/testID';
import { useAuth } from '../hooks/useAuth';
import { LogoutParams, useOAuthFlow } from '../hooks/useOAuthFlow';
import { Theme, createStyles } from '../components/BrandConfigProvider';

type OAuthLogoutButtonParams = Omit<TouchableOpacityProps, 'onPress'> &
  LogoutParams & {
    label: string;
    style?: OAuthLogoutButtonStyles;
  };

export const OAuthLogoutButton: FC<OAuthLogoutButtonParams> = ({
  onSuccess,
  onFail,
  label,
  style: instanceStyles,
  ...touchableOpacityProps
}) => {
  const { styles } = useStyles(defaultStyles, instanceStyles);
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

const defaultStyles = createStyles('OAuthLogoutButton', (theme: Theme) => ({
  button: {
    flexDirection: 'row',
  },
  touchableOpacity: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.buttonRoundness,
    minWidth: 64,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
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
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type OAuthLogoutButtonStyles = NamedStylesProp<typeof defaultStyles>;

import React, { FC, useCallback } from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  Text,
  TextStyle,
} from 'react-native';
import { useStyles } from '../../src/hooks/useStyles';
import { LoginParams, useOAuthFlow } from '../../src/hooks/useOAuthFlow';
import { tID } from '../common/testID';
import { Theme } from './BrandConfigProvider';

type OAuthLoginButtonParams = Omit<TouchableOpacityProps, 'onPress'> &
  LoginParams & {
    label: string;
    styles?: OAuthLoginButtonStyles;
  };

export const OAuthLoginButton: FC<OAuthLoginButtonParams> = ({
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
  const { login } = useOAuthFlow();

  const _login = useCallback(async () => {
    await login({
      onSuccess,
      onFail,
    });
  }, [login, onSuccess, onFail]);

  return (
    <View style={styles.button}>
      <TouchableOpacity
        testID={tID('oauth-login-button')}
        {...touchableOpacityProps}
        onPress={_login}
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
    borderRadius: 5 * theme.roundness,

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
    extends ComponentNamedStyles<'OAuthLoginButton', typeof defaultStyles> {}
}

export type OAuthLoginButtonStyles = NamedStylesProp<typeof defaultStyles>;

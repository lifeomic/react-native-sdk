import React from 'react';

import { Switch, Text } from 'react-native-paper';
import { useOAuthFlow } from '../hooks/useOAuthFlow';
import { createStyles } from './BrandConfigProvider';
import { NativeEventEmitter, View } from 'react-native';
import { useAsyncStorage } from '../hooks/useAsyncStorage';
import { useAuth, useStyles } from 'src/hooks';

/*
    Test toggle used to switch to a secondary environment during runtime.
    See AppDemo.tsx for implementation details. For now, due to caching, the app will require a manual
    reload after switching to and logging into a new environment.
*/

export function ToggleEnvironmentMenuItem({ onSuccess, onFail }: any) {
  const { logout } = useOAuthFlow();
  const { clearAuthResult } = useAuth();
  const [environment, setEnvironment] = useAsyncStorage('environment-toggle');
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        (Dev) Use Secondary Environment
      </Text>
      <Switch
        value={environment.data !== 'primary'}
        onValueChange={() => {
          setEnvironment(
            environment.data === 'primary' ? 'secondary' : 'primary',
          );
          logout({
            onSuccess,
            onFail,
          });
          clearAuthResult();
          new NativeEventEmitter({
            addListener: () => {},
            removeListeners: () => {},
          }).emit('environmentToggle');
        }}
      />
    </View>
  );
}

const defaultStyles = createStyles('ToggleEnvironmentMenuItem', (theme) => ({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: theme.colors.primary },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ToggleEnvironmentMenuItemStyles = NamedStylesProp<
  typeof defaultStyles
>;

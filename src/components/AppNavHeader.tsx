import React from 'react';

import { Appbar } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';

export function AppNavHeader({
  back,
  options,
  route,
  navigation,
}: NativeStackHeaderProps) {
  const { styles } = useStyles(defaultStyles);
  const title = options.title || route.name;

  return (
    <Appbar.Header style={styles.style}>
      {back ? (
        <Appbar.BackAction
          onPress={navigation.goBack}
          style={styles.backAction}
        />
      ) : null}
      <Appbar.Content title={title} style={styles.content} />
    </Appbar.Header>
  );
}

const defaultStyles = createStyles('AppNavHeader', () => ({
  style: {},
  content: {},
  backAction: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type AppNavHeaderStyles = NamedStylesProp<typeof defaultStyles>;

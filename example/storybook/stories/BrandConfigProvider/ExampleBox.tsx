import React from 'react';

import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { createStyles, Theme, useStyles } from '../../../../src';

interface Props {
  message: string;
  styles: ExampleBoxStyles;
}

export function ExampleBox({ message, styles: instanceStyles }: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const defaultStyles = createStyles('ExampleBox', (theme: Theme) => {
  const container: ViewStyle = {
    width: '63%',
    margin: theme.spacing.large,
    padding: theme.spacing.small,
    borderColor: theme.colors.onSurface,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: 8,
  };

  const text: TextStyle = {
    color: theme.colors.onSurface,
  };

  return {
    container,
    text,
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ExampleBoxStyles = NamedStylesProp<typeof defaultStyles>;

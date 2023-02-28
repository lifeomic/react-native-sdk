import React from 'react';

import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { Theme, useStyles } from 'src';
import { NamedStylesProp } from 'src/components/BrandConfigProvider/types';

interface Props {
  message: string;
  styles: ExampleBoxStyles;
}

export function ExampleBox({ message, styles }: Props) {
  const merged = useStyles('ExampleBox', defaultStyles, styles);

  return (
    <View style={merged.styles.container}>
      <Text style={merged.styles.text}>{message}</Text>
    </View>
  );
}

const defaultStyles = (theme: Theme) => {
  const container: ViewStyle = {
    width: '63%',
    margin: theme.spacing.large,
    padding: theme.spacing.small,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 8,
  };

  const text: TextStyle = {
    color: theme.colors.text,
  };

  return {
    container,
    text,
  };
};

declare module 'src/components/BrandConfigProvider/types' {
  interface ComponentStyles
    extends ComponentNamedStyles<'ExampleBox', typeof defaultStyles> {}
}

export type ExampleBoxStyles = NamedStylesProp<typeof defaultStyles>;

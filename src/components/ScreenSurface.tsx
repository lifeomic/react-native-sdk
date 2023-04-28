import React from 'react';

import { Surface } from 'react-native-paper';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { ScrollView, View } from 'react-native';

type Props = {
  children?: React.ReactNode;
  styles?: ScreenSurfaceStyles;
} & React.ComponentProps<typeof Surface>;

export function ScreenSurface({
  children,
  styles: instanceStyles,
  ...props
}: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <Surface style={styles.surface} {...props}>
      <ScrollView overScrollMode="always" showsVerticalScrollIndicator={false}>
        <View style={styles.container}>{children}</View>
      </ScrollView>
    </Surface>
  );
}

const defaultStyles = createStyles('ScreenSurface', (theme) => ({
  surface: {
    flex: 1,
    backgroundColor: theme.colors.elevation.level1,
  },
  scrollView: {},
  container: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.extraLarge,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ScreenSurfaceStyles = NamedStylesProp<typeof defaultStyles>;

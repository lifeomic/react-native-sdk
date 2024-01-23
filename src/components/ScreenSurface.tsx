import React from 'react';

import { Surface } from 'react-native-paper';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { ScrollView, View, ScrollViewProps } from 'react-native';

type Props = {
  children?: React.ReactNode;
  styles?: ScreenSurfaceStyles;
  scrollEnabled?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, 'scrollEnabled'>;
  Header?: React.ReactNode;
} & React.ComponentProps<typeof Surface>;

export function ScreenSurface({
  children,
  styles: instanceStyles,
  scrollEnabled,
  scrollViewProps,
  Header,
  ...props
}: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <Surface style={styles.surfaceView} {...props}>
      {Header}
      <ScrollView
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        {...scrollViewProps}
      >
        <View style={styles.container}>{children}</View>
      </ScrollView>
    </Surface>
  );
}

const defaultStyles = createStyles('ScreenSurface', (theme) => ({
  surfaceView: {
    flex: 1,
    height: '100%',
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

import React from 'react';
import { Text, View } from 'react-native';
import { LinkBroken } from '@lifeomic/chromicons-native';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../../hooks';

type Props = { style?: CirclesPostUnavailableStyles };

export const PostUnavailable = ({ style }: Props) => {
  const { styles } = useStyles(defaultStyles, style);
  return (
    <View style={styles.container}>
      <LinkBroken
        stroke={styles.iconTintColorImage?.tintColor}
        style={styles.icon}
      />

      <Text style={styles.headerText}>Oh No!</Text>

      <Text style={styles.bodyText}>
        Something went wrong loading this post.
      </Text>

      <Text style={styles.helpText}>Please try again later.</Text>
    </View>
  );
};

const defaultStyles = createStyles('Circles.PostUnavailable', (theme) => ({
  container: {
    alignItems: 'center',
  },
  iconTintColorImage: {
    tintColor: theme.colors.error,
  },
  headerText: {
    color: theme.colors.onBackground,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  bodyText: {
    marginBottom: theme.spacing.tiny,
    maxWidth: '100%',
  },
  helpText: {
    maxWidth: '100%',
  },
  icon: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CirclesPostUnavailableStyles = NamedStylesProp<
  typeof defaultStyles
>;

import React from 'react';
import { Text, View } from 'react-native';
import { t } from 'i18next';
import { createStyles, useIcons } from '../BrandConfigProvider';
import { useStyles } from '../../hooks';

type Props = { style?: CirclesPostUnavailableStyles };

export const PostUnavailable = ({ style }: Props) => {
  const { LinkBroken } = useIcons();
  const { styles } = useStyles(defaultStyles, style);
  return (
    <View style={styles.container}>
      <LinkBroken
        stroke={styles.iconTintColorImage?.tintColor}
        style={styles.icon}
      />

      <Text style={styles.headerText}>
        {t('circles.post-unavailable.header', 'Oh No!')}
      </Text>

      <Text style={styles.bodyText}>
        {t(
          'circles.post-unavailable.body',
          'Something went wrong loading this post.',
        )}
      </Text>

      <Text style={styles.helpText}>
        {t('circles.post-unavailable.help', 'Please try again later.')}
      </Text>
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

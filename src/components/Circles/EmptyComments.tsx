import React from 'react';
import { Text, View } from 'react-native';
import { t } from 'i18next';
import { useStyles } from '../../hooks';
import { createStyles, useIcons } from '../BrandConfigProvider';

type Props = { style?: CirclesEmptyCommentStyles };

export const EmptyComments = ({ style }: Props) => {
  const { MessageSquare } = useIcons();
  const { styles } = useStyles(defaultStyles, style);

  return (
    <View style={styles.container}>
      <MessageSquare
        stroke={styles?.iconTintColorImage?.tintColor}
        style={styles.iconImage}
      />

      <Text style={styles.bodyText}>
        {t('circles.empty-comments.body', 'No comments yet.')}
      </Text>

      <Text style={styles.helpText}>
        {t('circles.empty-comments.help', 'Be the first!')}
      </Text>
    </View>
  );
};

const defaultStyles = createStyles('Circles.EmptyComments', (theme) => ({
  container: {
    alignItems: 'center',
  },
  bodyText: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  helpText: {
    marginBottom: theme.spacing.tiny,
    maxWidth: '100%',
  },
  iconTintColorImage: {
    tintColor: theme.colors.outlineVariant,
  },
  iconImage: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CirclesEmptyCommentStyles = NamedStylesProp<typeof defaultStyles>;

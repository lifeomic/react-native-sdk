import React from 'react';
import { Text, View } from 'react-native';
import { formatDistanceToNow, isValid } from 'date-fns';
import { Post, useStyles, useTheme } from '../../hooks';
import { Avatar } from 'react-native-paper';
import { initials } from './initials';
import { createStyles } from '../BrandConfigProvider';

type Props = { post: Post; style?: CirclesCommentStyles };

export const Comment = ({ post, style }: Props) => {
  const { styles } = useStyles(defaultStyles, style);
  const theme = useTheme();

  const created = new Date(post?.createdAt!);
  const size =
    Math.min(Number(styles.avatar?.width), Number(styles.avatar?.height)) ||
    theme.spacing.large;

  return (
    <View style={styles.container}>
      <Avatar.Text
        size={size}
        style={styles.avatar}
        label={initials(post?.author?.profile?.displayName)}
      />
      <View style={styles.details}>
        <Text style={styles.usernameText}>
          {post?.author?.profile?.displayName}
        </Text>
        {isValid(created) && (
          <Text style={styles.responseTimeText}>
            {formatDistanceToNow(created)} ago
          </Text>
        )}
        <Text style={styles.messageText}>{post?.message}</Text>
      </View>
    </View>
  );
};

const defaultStyles = createStyles('Circles.Comment', (theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.medium,
    paddingBottom: theme.spacing.extraSmall,
  },
  avatar: {
    marginRight: theme.spacing.extraSmall,
    width: theme.spacing.large,
    height: theme.spacing.large,
  },
  messageText: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.tiny,
    borderRadius: theme.roundness,
    marginTop: theme.spacing.extraSmall,
    color: theme.colors.onSecondaryContainer,
    backgroundColor: theme.colors.secondaryContainer,
  },
  details: {},
  usernameText: {},
  responseTimeText: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CirclesCommentStyles = NamedStylesProp<typeof defaultStyles>;

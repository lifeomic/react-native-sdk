import React from 'react';
import { Text, View } from 'react-native';
import { formatDistanceToNow, isValid } from 'date-fns';
import { t } from 'i18next';
import { ParentType, Post, useStyles, useTheme } from '../../hooks';
import { Avatar, Button } from 'react-native-paper';
import { initials } from './initials';
import { createStyles } from '../BrandConfigProvider';
import { ReactionsToolbar } from './ReactionsToolbar';
import { ShowPostMenuButton } from './ShowPostMenuButton';

type Props = { post: Post; style?: ThreadCommentStyles; onComment: () => void };

export const ThreadComment = ({ post, style, onComment }: Props) => {
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
            {t('circles.thread-comment.responseTime', '{{responseTime}} ago', {
              responseTime: formatDistanceToNow(created),
            })}
          </Text>
        )}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{post?.message}</Text>
        </View>
        <View style={styles.toolbarContainer}>
          <Button
            style={styles.commentButton}
            contentStyle={styles.commentButtonContainer}
            labelStyle={styles.commentButtonText}
            compact={true}
            mode={'outlined'}
            onPress={onComment}
          >
            {t('post-comments', { count: post.replyCount })}
          </Button>
          <ReactionsToolbar post={post} />
        </View>
      </View>
      <ShowPostMenuButton post={post} parentType={ParentType.POST} />
    </View>
  );
};

const defaultStyles = createStyles('Circles.ThreadComment', (theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.medium,
    paddingLeft: 0,
    paddingBottom: theme.spacing.extraSmall,
  },
  details: { flex: 1 },
  avatar: {
    marginRight: theme.spacing.extraSmall,
    width: theme.spacing.large,
    height: theme.spacing.large,
  },
  messageContainer: {
    padding: theme.spacing.small / 2,
    borderRadius: theme.roundness,
    marginVertical: theme.spacing.extraSmall,
    color: theme.colors.onSurfaceVariant,
    backgroundColor: theme.colors.surfaceVariant,
    flex: 1,
  },
  messageText: {},
  usernameText: {},
  responseTimeText: {},
  toolbarContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: theme.spacing.extraSmall,
    marginBottom: theme.spacing.small,
  },
  commentButtonContainer: {},
  commentButton: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  commentButtonText: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 8,
    lineHeight: 10,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ThreadCommentStyles = NamedStylesProp<typeof defaultStyles>;

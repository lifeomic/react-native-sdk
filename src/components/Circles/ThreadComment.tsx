import React from 'react';
import { Text, View } from 'react-native';
import { formatDistanceToNow, isValid } from 'date-fns';
import { t } from 'i18next';
import { ParentType, Post, useStyles, useTheme } from '../../hooks';
import { Button } from 'react-native-paper';
import { createStyles, useIcons } from '../BrandConfigProvider';
import { ReactionsToolbar } from './ReactionsToolbar';
import { ShowPostMenuButton } from './ShowPostMenuButton';
import { ProfileImage } from './ProfileImage';

type Props = { post: Post; style?: ThreadCommentStyles; onReply: () => void };

export const ThreadComment = ({ post, style, onReply }: Props) => {
  const { styles } = useStyles(defaultStyles, style);
  const theme = useTheme();
  const { UserX } = useIcons();
  const created = new Date(post?.createdAt!);
  const size =
    Math.min(
      Number(styles.avatarView?.width),
      Number(styles.avatarView?.height),
    ) || theme.spacing.large;

  return (
    <View style={styles.container}>
      <ProfileImage
        size={size}
        style={styles.avatarView}
        fallbackIcon={(props) => {
          return UserX({ ...props, height: 12 });
        }}
        post={post}
      />
      <View style={styles.details}>
        <Text style={styles.usernameText}>
          {post?.author?.profile?.displayName ??
            t('circles.user-removed', '[User Removed]')}
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
            style={styles.replyButton}
            contentStyle={styles.replyButtonContainer}
            labelStyle={styles.replyButtonText}
            compact={true}
            mode={'outlined'}
            onPress={onReply}
          >
            {t('post-replies', { count: post.replyCount })}
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
  avatarView: {
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
  replyButtonContainer: {},
  replyButton: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  replyButtonText: {
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

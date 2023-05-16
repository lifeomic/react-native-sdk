import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Avatar, Button, List, Text } from 'react-native-paper';
import { formatDistanceToNow, isValid } from 'date-fns';
import { useStyles, useTheme } from '../../hooks';
import { ParentType, Post, Priority } from '../../hooks';
import { createStyles } from '../BrandConfigProvider';
import { ReactionsToolbar } from './ReactionsToolbar';
import { initials } from './initials';
import { t } from 'i18next';
import { AnnouncementBanner } from './AnnouncementBanner';
import { ShowPostMenuButton } from './ShowPostMenuButton';

interface PostProps {
  post: Post;
  onComment?: () => void;
}

export const PostItem = ({ post, onComment }: PostProps) => {
  const { styles } = useStyles(defaultStyles);
  const theme = useTheme();
  const size =
    Math.min(Number(styles.avatar?.width), Number(styles.avatar?.height)) ||
    theme.spacing.large;
  const avatarIcon = useMemo(
    () =>
      post.author?.profile.picture ? (
        <Avatar.Image
          size={size}
          style={styles.avatar}
          source={{ uri: post.author?.profile.picture }}
        />
      ) : (
        <Avatar.Text
          size={size}
          style={styles.avatar}
          label={initials(post?.author?.profile?.displayName)}
        />
      ),
    [
      post.author?.profile?.displayName,
      post.author?.profile.picture,
      size,
      styles.avatar,
    ],
  );

  const created = new Date(post?.createdAt!);
  const showPostMenuButton = useMemo(
    () => (
      <ShowPostMenuButton
        post={post}
        parentType={ParentType.CIRCLE}
        styles={{ iconButton: styles.showPostMenuButton }}
      />
    ),
    [post, styles.showPostMenuButton],
  );

  return (
    <View style={styles.container}>
      {post.priority === Priority.ANNOUNCEMENT && <AnnouncementBanner />}
      <List.Item
        title={post.author?.profile.displayName}
        description={
          isValid(created) &&
          t('circles.thread-post.responseTime', '{{responseTime}} ago', {
            responseTime: formatDistanceToNow(created),
          })
        }
        titleNumberOfLines={4}
        style={styles.listItem}
        left={() => avatarIcon}
        right={() => showPostMenuButton}
      />
      <Text variant="titleMedium" style={styles.messageText}>
        {post.message}
      </Text>
      <View style={styles.toolbarContainer}>
        {onComment && (
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
        )}
        <ReactionsToolbar post={post} />
      </View>
    </View>
  );
};

const defaultStyles = createStyles('Post', (theme) => ({
  container: {},
  listItem: { paddingLeft: theme.spacing.small },
  avatar: {
    marginRight: theme.spacing.extraSmall,
    width: theme.spacing.huge,
    height: theme.spacing.huge,
  },
  messageText: {
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.tiny,
  },
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
  showPostMenuButton: {
    paddingLeft: theme.spacing.medium,
    marginTop: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostStyle = NamedStylesProp<typeof defaultStyles>;

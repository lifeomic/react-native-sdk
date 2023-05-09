import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Divider, List, Text } from 'react-native-paper';
import { formatRelative } from 'date-fns';
import { useStyles } from '../../hooks';
import type { Post as PostType } from '../../hooks/usePosts';
import { createStyles } from '../BrandConfigProvider';
import { ReactionsToolbar } from './ReactionsToolbar';

interface PostProps {
  post: PostType;
}

export const Post = ({ post }: PostProps) => {
  const { styles } = useStyles(defaultStyles);
  const avatarIcon = useMemo(
    () =>
      post.author?.profile.picture ? (
        <Avatar.Image
          size={50}
          style={styles.icon}
          source={{ uri: post.author?.profile.picture }}
        />
      ) : (
        <Avatar.Icon size={50} style={styles.icon} icon={'account'} />
      ),
    [post.author?.profile.picture, styles.icon],
  );

  return (
    <View style={styles.container}>
      <List.Item
        title={post.author?.profile.displayName}
        description={formatRelative(new Date(post.createdAt), new Date())}
        titleNumberOfLines={4}
        style={styles.listItem}
        left={() => avatarIcon}
      />
      <Text variant="titleMedium" style={styles.messageText}>
        {post.message}
      </Text>
      <View style={styles.toolbarContainer}>
        <Button
          style={styles.commentButton}
          contentStyle={styles.commentButtonContainer}
          labelStyle={styles.commentButtonText}
          compact={true}
          mode={'outlined'}
          onPress={() => {}} // TODO: Navigate to post details/comments page
        >
          {post.replyCount} COMMENTS
        </Button>
        <ReactionsToolbar post={post} />
      </View>
      <Divider />
    </View>
  );
};

const defaultStyles = createStyles('Post', (theme) => ({
  container: {},
  listItem: { paddingLeft: theme.spacing.small },
  icon: {},
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
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostStyle = NamedStylesProp<typeof defaultStyles>;

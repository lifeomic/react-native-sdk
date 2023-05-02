import { formatRelative } from 'date-fns';
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Avatar, Divider, List, Text } from 'react-native-paper';
import { useStyles } from '../../hooks';
import { ActivePost } from '../../hooks/usePosts';
import { createStyles } from '../BrandConfigProvider';

interface PostProps {
  post: ActivePost;
}

export const Post = ({ post }: PostProps) => {
  const { styles } = useStyles(defaultStyles);
  const avatarIcon = useMemo(
    () =>
      post.author.profile.picture ? (
        <Avatar.Image
          size={50}
          style={styles.icon}
          source={{ uri: post.author.profile.picture }}
        />
      ) : (
        <Avatar.Icon size={50} style={styles.icon} icon={'account'} />
      ),
    [post.author.profile.picture, styles.icon],
  );
  return (
    <View style={styles.container}>
      <List.Item
        title={post.author.profile.displayName}
        description={formatRelative(new Date(post.createdAt), new Date())}
        titleNumberOfLines={4}
        style={styles.listItem}
        left={() => avatarIcon}
      />
      <Text variant="titleMedium" style={styles.messageText}>
        {post.message}
      </Text>
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
    paddingBottom: theme.spacing.small,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostStyle = NamedStylesProp<typeof defaultStyles>;

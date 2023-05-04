import React from 'react';
import { Text, View } from 'react-native';
import { formatDistanceToNow, isValid } from 'date-fns';
import { Post as PostType, useStyles, useTheme } from '../../hooks';
import { Avatar } from 'react-native-paper';
import { initials } from './initials';
import { createStyles } from '../BrandConfigProvider';

type Props = { post: PostType; style?: ThreadPostStyles };

export const ThreadPost = ({ post, style }: Props) => {
  const { styles } = useStyles(defaultStyles, style);
  const theme = useTheme();

  const created = new Date(post?.createdAt!);
  const size =
    Math.min(Number(styles.avatar?.width), Number(styles.avatar?.height)) ||
    theme.spacing.huge;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={size}
          style={styles.avatar}
          label={initials(post?.author?.profile?.displayName)}
        />
        <View>
          <Text style={styles.usernameText}>
            {post?.author?.profile?.displayName}
          </Text>
          {isValid(created) && (
            <Text style={styles.responseTimeText}>
              {formatDistanceToNow(new Date(post?.createdAt!))} ago
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.messageText}>{post?.message}</Text>
    </View>
  );
};

const defaultStyles = createStyles('Circles.ThreadPost', (theme) => ({
  container: {
    marginBottom: theme.spacing.extraSmall,
    padding: theme.spacing.medium,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.extraSmall,
  },
  avatar: {
    marginRight: theme.spacing.extraSmall,
    width: theme.spacing.huge,
    height: theme.spacing.huge,
  },
  messageText: {
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.fonts.bodyLarge,
  },
  usernameText: {},
  responseTimeText: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ThreadPostStyles = NamedStylesProp<typeof defaultStyles>;

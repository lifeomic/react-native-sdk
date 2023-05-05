import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { usePost, Post, useStyles } from '../../hooks';
import { ThreadComment } from './ThreadComment';
import { ThreadPost } from './ThreadPost';
import { PostUnavailable } from './PostUnavailable';
import { EmptyComments } from './EmptyComments';
import { createStyles } from '../BrandConfigProvider';

export interface ThreadProps {
  postId: string;
  post?: Post;
  style?: CirclesThreadStyles;
}

export const Thread = ({ postId, post: postIn }: ThreadProps) => {
  const { styles } = useStyles(defaultStyles);
  const { data, isLoading, error, refetch, isRefetching } = usePost(
    postId,
    !!postIn,
  );

  const post = data?.post ?? postIn;
  const replies = post?.replies?.edges;

  const entries = useMemo(() => {
    const comments = replies?.map(({ node }) => node).reverse() ?? [];
    return comments.flatMap((comment) => entriesForPost(comment));
  }, [replies]);

  return (
    <FlatList
      testID="post-details-list"
      data={entries}
      renderItem={renderItem}
      refreshing={isLoading || isRefetching}
      onRefresh={postIn ? undefined : refetch}
      initialNumToRender={35}
      style={styles.container}
      ListHeaderComponent={!error && post ? <ThreadPost post={post} /> : null}
      ListEmptyComponent={
        <View
          style={styles.emptyPostCommentsContainer}
          testID="empty-state-post-list-details"
        >
          {error ? <PostUnavailable /> : <EmptyComments />}
        </View>
      }
    />
  );
};

export type PostListEntry = {
  key: string;
  post: Post;
  depth: number;
};

const renderItem = ({ item }: { item: PostListEntry }) => {
  return (
    <View style={{ paddingLeft: item.depth * 20 }}>
      <ThreadComment post={item.post} />
    </View>
  );
};

const entriesForPost = (post: Post, depth = 0): PostListEntry[] => {
  const replies = (post?.replies?.edges ?? [])
    .slice(0)
    .reverse()
    .map(({ node: reply }) => entriesForPost(reply, depth + 1))
    .flat();

  return [
    {
      key: post.id,
      post,
      depth,
    },
    ...replies,
  ];
};

const defaultStyles = createStyles('Circles.Thread', (theme) => ({
  container: { flex: 1 },
  emptyPostCommentsContainer: {
    marginTop: theme.spacing.extraLarge,
    flex: 1,
    padding: theme.spacing.large,
    alignItems: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CirclesThreadStyles = NamedStylesProp<typeof defaultStyles>;

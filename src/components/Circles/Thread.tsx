import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { t } from 'i18next';
import { usePost, Post, useStyles, useTheme, ParentType } from '../../hooks';
import { ThreadComment } from './ThreadComment';
import { ThreadPost } from './ThreadPost';
import { PostUnavailable } from './PostUnavailable';
import { EmptyComments } from './EmptyComments';
import { createStyles } from '../BrandConfigProvider';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { CreateEditPostModal } from './CreateEditPostModal';

export interface ThreadProps {
  post: Post;
  style?: CirclesThreadStyles;
  createComment?: boolean;
  onOpenThread: (post: Post, createNewComment: boolean) => void;
}

export const Thread = (props: ThreadProps) => {
  const { colors } = useTheme();
  const { post: postIn, style, createComment = false, onOpenThread } = props;
  const [isCreateCommentOpen, setIsCreateCommentOpen] = useState(createComment);
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false);
  const listRef = useRef<FlatList>(null);
  const { styles } = useStyles(defaultStyles, style);
  const { data, isLoading, error, refetch, isRefetching, isFetched } =
    usePost(postIn);

  const post = data?.post;
  const replies = post?.replies?.edges;

  const handleCreatePostClosed = useCallback((createdNewPost?: boolean) => {
    setIsCreateCommentOpen(false);
    setShouldScrollToEnd(!!createdNewPost);
  }, []);

  const comments = replies?.map(({ node }) => node).reverse() ?? [];
  const entries = comments.flatMap((comment) => entriesForPost(comment));

  const handleContentSizeChanged = useCallback(() => {
    if (shouldScrollToEnd) {
      setShouldScrollToEnd(false);
      try {
        listRef.current?.scrollToIndex({
          index: entries.length - 1,
          viewOffset: 100,
        });
      } catch {
        // Scrolling failed but that's okay.
      }
    }
  }, [shouldScrollToEnd, entries.length]);

  return (
    <>
      <FlatList
        testID="post-details-list"
        data={entries}
        ref={listRef}
        renderItem={renderItem({ onOpenThread })}
        refreshControl={
          <RefreshControl
            onRefresh={refetch}
            refreshing={isFetched && (isLoading || isRefetching)}
            colors={[colors.primarySource]}
            tintColor={colors.inversePrimary}
          />
        }
        onContentSizeChange={handleContentSizeChanged}
        initialNumToRender={35}
        style={styles.container}
        ListHeaderComponent={
          !error && post ? <ThreadPost post={post as Post} /> : null
        }
        ListFooterComponent={
          !isFetched && (isLoading || isRefetching) ? (
            <ActivityIndicatorView
              message={t('thread-screen-loading-comments', 'Loading comments')}
            />
          ) : null
        }
        ListEmptyComponent={
          isLoading || isRefetching ? null : (
            <View
              style={styles.emptyPostCommentsContainer}
              testID="empty-state-post-list-details"
            >
              {error ? <PostUnavailable /> : <EmptyComments />}
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.addCommentBox}
        onPress={() => setIsCreateCommentOpen(true)}
      >
        <Text style={styles.addCommentText}>
          {t('thread-screen-add-comment', 'Add a comment')}
        </Text>
      </TouchableOpacity>

      <View style={style?.createPostModalContainer}>
        {post?.id && (
          <CreateEditPostModal
            visible={isCreateCommentOpen}
            onModalClose={handleCreatePostClosed}
            parentType={ParentType.POST}
            parentId={post.id}
            postToEdit={post as Post}
          />
        )}
      </View>
    </>
  );
};

export type PostListEntry = {
  key: string;
  post: Post;
  depth: number;
};

const renderItem =
  ({
    onOpenThread,
  }: {
    onOpenThread: (post: Post, createNewComment: boolean) => void;
  }) =>
  ({ item }: { item: PostListEntry }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={{ paddingLeft: item.depth * 20 }}
        onPress={() => onOpenThread(item.post, false)}
      >
        <ThreadComment
          post={item.post}
          onComment={() => onOpenThread(item.post, true)}
        />
      </TouchableOpacity>
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
  addCommentBox: {
    backgroundColor: theme.colors.inverseOnSurface,
    padding: theme.spacing.medium,
    flex: 0,
  },
  addCommentText: {
    color: theme.colors.onPrimaryContainer,
    backgroundColor: theme.colors.primaryContainer,
    padding: theme.spacing.small,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  createPostModalContainer: {
    height: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CirclesThreadStyles = NamedStylesProp<typeof defaultStyles>;

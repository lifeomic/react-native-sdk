import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { FlatList, View, RefreshControl, TouchableOpacity } from 'react-native';
import { t } from 'i18next';
import { Text, Button } from 'react-native-paper';
import {
  usePost,
  Post,
  useStyles,
  useTheme,
  ParentType,
  useLoadReplies,
} from '../../hooks';
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
  const {
    loadReplies,
    isFetching: isLoadingReplies,
    queryVariables,
  } = useLoadReplies();
  const { data, isLoading, error, refetch, isRefetching, isFetched } =
    usePost(postIn);

  const post = data?.post;

  const handleCreatePostClosed = useCallback((createdNewPost?: boolean) => {
    setIsCreateCommentOpen(false);
    setShouldScrollToEnd(!!createdNewPost);
  }, []);

  const entries = entriesForPost(
    post as Post,
    isLoadingReplies ? queryVariables.id : undefined,
  );
  const handleContentSizeChanged = useCallback(() => {
    if (shouldScrollToEnd && entries) {
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
  }, [shouldScrollToEnd, entries]);

  const renderItemMemoized = useMemo(
    () =>
      renderItem({
        onLoadReplies: loadReplies,
        onOpenThread,
      }),
    [loadReplies, onOpenThread],
  );

  return (
    <>
      <FlatList
        testID="post-details-list"
        data={entries}
        ref={listRef}
        renderItem={renderItemMemoized}
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
} & (
  | {
      tag: 'load-more-posts';
      unloadedReplyCount: number;
      isLoading: boolean;
    }
  | {}
);

const renderItem =
  ({
    onOpenThread,
    onLoadReplies,
  }: {
    onOpenThread: (post: Post, createNewComment: boolean) => void;
    onLoadReplies: (post: Post) => void;
  }) =>
  ({ item }: { item: PostListEntry }) => {
    const marginLeft = item.depth * 20;

    if ('tag' in item && item.tag === 'load-more-posts') {
      return (
        <View style={{ alignItems: 'flex-start', marginLeft }}>
          <LoadMoreCommentsButton
            isLoading={item.isLoading}
            count={item.unloadedReplyCount}
            onPress={() => {
              setTimeout(() => onLoadReplies(item.post), 0);
            }}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={{ marginLeft }}
        onPress={() => onOpenThread(item.post, false)}
      >
        <ThreadComment
          post={item.post}
          onComment={() => onOpenThread(item.post, true)}
        />
      </TouchableOpacity>
    );
  };

const LoadMoreCommentsButton = ({
  count,
  isLoading,
  onPress,
}: {
  count: number;
  isLoading: boolean;
  onPress: () => void;
}) => {
  const [loading, setLoading] = useState(isLoading);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  return (
    <Button
      mode="text"
      loading={loading}
      onPress={() => {
        if (!loading) {
          setLoading(true);
          onPress();
        }
      }}
    >
      {t('thread-load-comments', 'Read {{count}} earlier comments...', {
        count,
      })}
    </Button>
  );
};

const entriesForPost = (
  post: Post,
  loadingRepliesForPostId: string | undefined,
  depth = 0,
): PostListEntry[] => {
  const replies = (post?.replies?.edges ?? [])
    .slice(0)
    .reverse()
    .map(({ node: reply }) =>
      entriesForPost(reply, loadingRepliesForPostId, depth + 1),
    )
    .flat();

  const replyCount = post?.replies?.edges?.length ?? 0;

  return [
    ...(depth > 0
      ? [
          {
            key: post.id,
            post,
            depth,
          },
        ]
      : []),
    ...(post?.replyCount > replyCount && post?.replies?.pageInfo?.endCursor
      ? [
          {
            key: `${post.id}-load-more-${post?.replies?.pageInfo?.endCursor}`,
            post,
            depth: depth + 1,
            tag: 'load-more-posts' as const,
            unloadedReplyCount: post.replyCount - replyCount,
            isLoading: loadingRepliesForPostId === post.id,
          },
        ]
      : []),
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

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import {
  FlatList,
  View,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { t } from 'i18next';
import { Button } from 'react-native-paper';
import { Post, useStyles, useTheme, ParentType } from '../../hooks';
import { usePost } from '../../hooks/Circles/usePost';
import { useLoadReplies } from '../../hooks/Circles/useLoadReplies';
import { ThreadComment } from './ThreadComment';
import { PostUnavailable } from './PostUnavailable';
import { EmptyComments } from './EmptyComments';
import { createStyles } from '../BrandConfigProvider';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { PostItem as PostItem } from './PostItem';
import { CreatePostToolbar } from './CreatePostToolbar';
import { useHeaderHeight } from '@react-navigation/elements';

export interface ThreadProps {
  post: Post;
  style?: CirclesThreadStyles;
  createComment?: boolean;
  onPostDeleted: () => void;
}

export const Thread = (props: ThreadProps) => {
  const { colors } = useTheme();
  const { post: postIn, style, onPostDeleted } = props;
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false);
  const [commentPost, setCommentPost] = useState(postIn.id);
  const textInputRef = useRef<TextInput>();
  const listRef = useRef<FlatList>(null);
  const height = useHeaderHeight();
  const { styles } = useStyles(defaultStyles, style);
  const {
    loadReplies,
    isFetching: isLoadingReplies,
    queryVariables,
  } = useLoadReplies();
  const { data, isLoading, error, refetch, isRefetching, isFetched } =
    usePost(postIn);

  const post = data?.post;

  const handleNewReply = useCallback(
    ({ shouldScroll }: { shouldScroll: boolean }) => {
      setShouldScrollToEnd(shouldScroll);
    },
    [],
  );

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
        onPressReply: (postId: string) => {
          setCommentPost(postId);
          textInputRef.current?.focus();
        },
      }),
    [loadReplies],
  );

  useEffect(() => {
    if (!data?.post) {
      onPostDeleted();
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={height}
    >
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
        style={styles.threadContainer}
        ListHeaderComponent={
          !error && post ? (
            <PostItem
              post={post as Post}
              onComment={() => {
                setCommentPost(post.id);
                textInputRef.current?.focus();
              }}
            />
          ) : null
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
      <CreatePostToolbar
        parentId={commentPost}
        parentType={ParentType.POST}
        rootPostId={postIn.id}
        circleId={postIn.circle?.id}
        onSubmit={handleNewReply}
        textInputRef={textInputRef}
      />
    </KeyboardAvoidingView>
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
    onLoadReplies,
    onPressReply,
  }: {
    onLoadReplies: (post: Post) => void;
    onPressReply: (id: string) => void;
  }) =>
  ({ item }: { item: PostListEntry }) => {
    const marginLeft = item.depth * 20;
    const onPressReplyAtDepth = () => {
      item.depth > 1
        ? onPressReply(item?.post?.parentId)
        : onPressReply(item?.post?.id);
    };

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
      <View style={{ marginLeft }}>
        <ThreadComment post={item.post} onReply={() => onPressReplyAtDepth()} />
      </View>
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
  threadContainer: { flex: 1 },
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

import { t } from 'i18next';
import React, { useCallback } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { Divider, FAB, Text } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { CircleTile } from '../../hooks/useAppConfig';
import { Post, useInfinitePosts, ParentType } from '../../hooks';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { createStyles } from '../BrandConfigProvider/styles/createStyles';
import { PostItem } from './PostItem';
import { ActivityIndicatorViewStyles } from '../ActivityIndicatorView';
import { tID } from '../../common';
import { showCreateEditPostModal } from './CreateEditPostModal';
import { ThreadComment } from './ThreadComment';
import { useIcons } from '../BrandConfigProvider';

interface PostsListProps {
  circleTile?: CircleTile;
  onOpenPost: (post: Post, openComment: boolean) => void;
}

export const PostsList = ({ circleTile, onOpenPost }: PostsListProps) => {
  const { Edit2 } = useIcons();
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfinitePosts({
      circleId: circleTile?.circleId,
    });
  const { styles } = useStyles(defaultStyles);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (
        event.nativeEvent.contentOffset.y +
          event.nativeEvent.layoutMeasurement.height >=
        event.nativeEvent.contentSize.height
      ) {
        if (hasNextPage && !isLoading) {
          fetchNextPage();
        }
      }
    },
    [hasNextPage, isLoading, fetchNextPage],
  );

  const handlePostTapped = useCallback(
    (post: Post, createNewComment = false) =>
      () => {
        onOpenPost(post, createNewComment);
      },
    [onOpenPost],
  );

  if (!data || !circleTile?.circleId) {
    return (
      <ActivityIndicatorView
        message={t('posts-screen-loading-notifications', 'Loading results')}
      />
    );
  }

  return (
    <View style={styles.rootView}>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {data.pages.map((page, pageIndex) => (
          <React.Fragment key={`page-${pageIndex}`}>
            {page?.postsV2?.edges.length > 0 ? (
              page.postsV2.edges.map((edge, postIndex) => (
                <TouchableOpacity
                  key={`post-${postIndex}`}
                  onPress={handlePostTapped(edge.node)}
                  activeOpacity={0.6}
                >
                  <PostItem
                    post={edge.node}
                    onComment={handlePostTapped(edge.node, true)}
                  />
                  <View style={styles.repliesContainer}>
                    {edge.node.replies?.edges.map((replyEdge) => (
                      <ThreadComment
                        key={replyEdge.node.id}
                        post={replyEdge.node}
                        onReply={handlePostTapped(edge.node, false)}
                      />
                    ))}
                  </View>
                  <Divider />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noPostsText}>
                {t('posts-no-posts', 'No posts yet.')}
              </Text>
            )}
          </React.Fragment>
        ))}
        <ActivityIndicatorView
          animating={isFetchingNextPage}
          style={styles.morePostsIndicator}
        />
      </ScrollView>
      <FAB
        testID={tID('new-post-button')}
        icon={Edit2}
        style={styles.fabView}
        onPress={() => {
          showCreateEditPostModal({
            parentType: ParentType.CIRCLE,
            parentId: circleTile.circleId,
          });
        }}
      />
    </View>
  );
};

const defaultStyles = createStyles('PostsList', (theme) => {
  const activityIndicatorStyle: ActivityIndicatorViewStyles = {
    view: { paddingTop: theme.spacing.medium },
  };

  return {
    rootView: { minHeight: '100%', maxHeight: '100%' },
    scrollView: { minHeight: '100%' },
    morePostsIndicator: activityIndicatorStyle,
    noPostsText: {},
    fabView: {
      position: 'absolute',
      margin: theme.spacing.medium,
      right: 0,
      bottom: 0,
      borderRadius: 32,
    },
    repliesContainer: {
      marginLeft: theme.spacing.medium,
    },
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostsListStyle = NamedStylesProp<typeof defaultStyles>;

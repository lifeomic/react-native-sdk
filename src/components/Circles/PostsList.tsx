import { t } from 'i18next';
import React, { useCallback } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { CircleTile } from '../../hooks/useAppConfig';
import { useInfinitePosts } from '../../hooks/useInfinitePosts';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { createStyles } from '../BrandConfigProvider/styles/createStyles';
import { Post } from './Post';
import { ActivityIndicatorViewStyles } from '../ActivityIndicatorView';

interface PostsListProps {
  circleTile?: CircleTile;
}

export const PostsList = ({ circleTile }: PostsListProps) => {
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

  if (!data) {
    return (
      <ActivityIndicatorView
        message={t('posts-screen-loading-notifications', 'Loading results')}
      />
    );
  }

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={400}
      contentContainerStyle={styles.scrollView}
    >
      {data.pages.map((page, pageIndex) => (
        <React.Fragment key={`page-${pageIndex}`}>
          {page?.postsV2?.edges.length > 0 ? (
            page.postsV2.edges.map((edge, postIndex) => (
              <Post key={`post-${postIndex}`} post={edge.node} />
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
        style={styles.morePostsIndicatorAny}
      />
    </ScrollView>
  );
};

const defaultStyles = createStyles('PostsList', (theme) => {
  const activityIndicatorStyle: ActivityIndicatorViewStyles = {
    view: { paddingTop: theme.spacing.medium },
  };

  return {
    scrollView: {},
    morePostsIndicatorAny: activityIndicatorStyle,
    noPostsText: {},
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostsListStyle = NamedStylesProp<typeof defaultStyles>;

import { t } from 'i18next';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { CircleTile } from '../../hooks/useAppConfig';
import { usePosts } from '../../hooks/usePosts';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { Post } from './Post';

const PostsList = ({ circleTile }: { circleTile?: CircleTile }) => {
  const { data, hasNextPage, fetchNextPage, isLoading } = usePosts({
    circleId: circleTile?.circleId,
  });

  const handleScroll = useCallback(
    (event: any) => {
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
    <ScrollView onScroll={handleScroll} scrollEventThrottle={400}>
      {data.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page?.postsV2?.edges.length > 0 ? (
            page.postsV2.edges.map((edge) => (
              <Post key={edge.node.id} post={edge.node} />
            ))
          ) : (
            <Text>{t('posts-no-posts', 'No posts yet.')}</Text>
          )}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

export default PostsList;

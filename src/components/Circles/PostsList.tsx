import { t } from 'i18next';
import React, { useCallback, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { CircleTile } from '../../hooks/useAppConfig';
import { useInfinitePosts } from '../../hooks/usePosts';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { createStyles } from '../BrandConfigProvider/styles/createStyles';
import { Post } from './Post';
import { ActivityIndicatorViewStyles } from '../ActivityIndicatorView';
import { CreateEditPostModal } from './CreateEditPostModal';
import { ParentType } from '../../hooks/usePosts';
import { tID } from '../../common';

interface PostsListProps {
  circleTile?: CircleTile;
}

export const PostsList = ({ circleTile }: PostsListProps) => {
  const [visible, setVisible] = useState(false);

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

  if (!data || !circleTile?.circleId) {
    return (
      <ActivityIndicatorView
        message={t('posts-screen-loading-notifications', 'Loading results')}
      />
    );
  }

  return (
    <View>
      <CreateEditPostModal
        visible={visible}
        setVisible={setVisible}
        parentType={ParentType.CIRCLE}
        parentId={circleTile.circleId}
      />
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
      <FAB
        testID={tID('new-post-button')}
        icon="pencil"
        style={styles.fab}
        onPress={() => setVisible(() => true)}
      />
    </View>
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
    fab: {
      position: 'absolute',
      margin: theme.spacing.medium,
      right: 0,
      bottom: 0,
      borderRadius: 32,
    },
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PostsListStyle = NamedStylesProp<typeof defaultStyles>;

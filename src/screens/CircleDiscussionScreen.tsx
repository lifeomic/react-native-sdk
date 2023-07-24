import React, { useCallback, useLayoutEffect } from 'react';
import { PostsList } from '../components/Circles/PostsList';
import { HomeStackScreenProps } from '../navigators/types';
import { Post } from '../hooks';
import { useActiveCircleTile } from '../hooks/Circles/useActiveCircleTile';

export const CircleDiscussionScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Circle/Discussion'>) => {
  const { setCircleTile } = useActiveCircleTile();
  const { circleTile } = route.params;
  setCircleTile?.(circleTile);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: circleTile?.circleName,
    });
  }, [navigation, circleTile?.circleName]);

  const openPost = useCallback(
    (post: Post, createNewComment: boolean) => {
      navigation.navigate('Circle/Thread', { post, createNewComment });
    },
    [navigation],
  );

  return <PostsList onOpenPost={openPost} />;
};

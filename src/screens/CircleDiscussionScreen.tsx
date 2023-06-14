import React, { useCallback, useLayoutEffect } from 'react';
import { PostsList } from '../components/Circles/PostsList';
import { HomeStackScreenProps } from '../navigators/types';
import { Post } from '../hooks';

export const CircleDiscussionScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Circle/Discussion'>) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.circleTile.circleName,
    });
  }, [navigation, route.params.circleTile.circleName]);

  const openPost = useCallback(
    (post: Post, createNewComment: boolean) => {
      navigation.navigate('Home/Circle/Thread', { post, createNewComment });
    },
    [navigation],
  );

  return (
    <PostsList circleTile={route.params.circleTile} onOpenPost={openPost} />
  );
};

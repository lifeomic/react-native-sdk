import React, { useLayoutEffect } from 'react';
import PostsList from '../components/Circles/PostsList';
import { HomeStackScreenProps } from '../navigators/types';

export const PostsScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Posts'>) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.circleTile.circleName,
    });
  }, [navigation, route.params.circleTile.circleName]);

  return <PostsList circleTile={route.params.circleTile} />;
};

import React, { useLayoutEffect } from 'react';
import { HomeStackScreenProps } from '../navigators/types';
import { Thread } from '../components/Circles/Thread';

export const CircleThreadScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Circle/Thread'>) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${route.params.post.author?.profile.displayName}'s Post`,
    });
  }, [navigation, route.params.post]);

  return <Thread post={route.params.post} />;
};

import React, { useLayoutEffect, useCallback } from 'react';
import { t } from 'i18next';
import { HomeStackScreenProps } from '../navigators/types';
import { Thread } from '../components/Circles/Thread';
import { Post } from '../hooks';

export const CircleThreadScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Circle/Thread'>) => {
  useLayoutEffect(() => {
    if (route.params.post.author) {
      navigation.setOptions({
        title: t('circle-thread-screen-title', "{{name}}'s Post", {
          name: route.params.post.author.profile.displayName,
        }),
      });
    }
  }, [navigation, route.params.post.author]);

  const openPost = useCallback(
    (post: Post, createNewComment: boolean) => {
      navigation.push('Home/Circle/Thread', { post, createNewComment });
    },
    [navigation],
  );

  const navigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Thread
      post={route.params.post}
      createComment={route.params.createNewComment ?? false}
      onOpenThread={openPost}
      onPostDeleted={navigateBack}
    />
  );
};

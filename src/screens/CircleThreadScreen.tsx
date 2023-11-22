import React, { useLayoutEffect, useCallback } from 'react';
import { t } from 'i18next';
import { LoggedInRootScreenProps } from '../navigators/types';
import { Thread } from '../components/Circles/Thread';

export const CircleThreadScreen = ({
  navigation,
  route,
}: LoggedInRootScreenProps<'Circle/Thread'>) => {
  useLayoutEffect(() => {
    if (route.params.post.author) {
      navigation.setOptions({
        title: t('circle-thread-screen-title', "{{name}}'s Post", {
          name: route.params.post.author.profile.displayName,
        }),
      });
    }
  }, [navigation, route.params.post.author]);

  const navigateBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Thread
      post={route.params.post}
      createComment={route.params.createNewComment ?? false}
      onPostDeleted={navigateBack}
    />
  );
};

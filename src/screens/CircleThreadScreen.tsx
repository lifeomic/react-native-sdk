import React, { useLayoutEffect } from 'react';
import { t } from 'i18next';
import { HomeStackScreenProps } from '../navigators/types';
import { Thread } from '../components/Circles/Thread';

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

  return <Thread post={route.params.post} />;
};

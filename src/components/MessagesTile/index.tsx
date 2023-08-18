import React from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { useUser, useHasNewMessagesFromUsers } from '../../hooks';
import { useIcons } from '../BrandConfigProvider';

interface Props extends Pick<HomeStackScreenProps<'Home'>, 'navigation'> {
  id: string;
  title: string;
  recipientsUserIds: string[];
}

export function MessagesTile({
  navigation,
  title,
  id,
  recipientsUserIds,
}: Props) {
  const { data } = useUser();
  const { MessageCircle } = useIcons();
  const unreadIds = useHasNewMessagesFromUsers({
    currentUserId: data?.id,
    userIds: recipientsUserIds,
  });

  return (
    <Tile
      id={id}
      key={id}
      title={title}
      Icon={MessageCircle}
      showBadge={unreadIds.length > 0}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          recipientsUserIds: recipientsUserIds,
        });
      }}
    />
  );
}

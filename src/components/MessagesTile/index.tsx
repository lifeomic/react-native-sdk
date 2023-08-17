import React from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { useUser, useHasNewMessagesFromUsers } from '../../hooks';

interface Props extends Pick<HomeStackScreenProps<'Home'>, 'navigation'> {}

export function MessagesTile({ navigation }: Props) {
  const { data } = useUser();
  const mockUserIds = ['brucetest0005', '6fab714']; // TODO: Fetch from tile config
  const recipients = mockUserIds.filter((v) => v !== data?.id);
  const unreadIds = useHasNewMessagesFromUsers({
    currentUserId: data?.id,
    userIds: recipients,
  });

  return (
    <Tile
      id="messages"
      key="messages"
      title="Messages"
      showBadge={unreadIds.length > 0}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          recipientsUserIds: recipients,
        });
      }}
    />
  );
}

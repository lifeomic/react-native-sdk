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

export function MessagesTile({ navigation }: Props) {
  const { data } = useUser();
  const mockUserIds = ['brucetest0005', '6fab714']; // TODO: Once backend is in place switch to using the props
  const recipients = mockUserIds.filter((v) => v !== data?.id);
  const { MessageCircle } = useIcons();
  const unreadIds = useHasNewMessagesFromUsers({
    currentUserId: data?.id,
    userIds: recipients,
  });

  return (
    <Tile
      id="messages"
      key="messages"
      title="Messages"
      Icon={MessageCircle}
      showBadge={unreadIds.length > 0}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          recipientsUserIds: recipients,
        });
      }}
    />
  );
}

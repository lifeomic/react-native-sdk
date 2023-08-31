import React from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { useIcons } from '../BrandConfigProvider';
import { tID } from '../TrackTile/common/testID';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

interface Props extends Pick<HomeStackScreenProps<'Home'>, 'navigation'> {
  id: string;
  title: string;
  recipientsUserIds: string[];
}

export function MessagesTile({ navigation, title, id }: Props) {
  const { MessageCircle } = useIcons();
  const { unreadIds } = useUnreadMessages();

  return (
    <Tile
      id={id}
      key={id}
      title={title}
      testID={tID('message-tile')}
      Icon={MessageCircle}
      showBadge={unreadIds && unreadIds.length > 0}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          tileId: id,
        });
      }}
    />
  );
}

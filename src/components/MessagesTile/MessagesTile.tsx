import React from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { useIcons } from '../BrandConfigProvider';
import { tID } from '../TrackTile/common/testID';
import { useHasUnread } from '../../hooks/useConversations';

interface Props extends Pick<HomeStackScreenProps<'Home'>, 'navigation'> {
  id: string;
  title: string;
  recipientsUserIds: string[];
}

export function MessagesTile({ navigation, title, id }: Props) {
  const { MessageCircle } = useIcons();
  const hasUnread = useHasUnread();

  return (
    <Tile
      id={id}
      key={id}
      title={title}
      testID={tID('message-tile')}
      Icon={MessageCircle}
      showBadge={hasUnread}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          tileId: id,
        });
      }}
    />
  );
}

import React from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { tID } from '../TrackTile/common/testID';
import { useHasUnread } from '../../hooks/useConversations';
import { SvgProps } from 'react-native-svg';

interface Props extends Pick<HomeStackScreenProps<'Home'>, 'navigation'> {
  id: string;
  title: string;
  Icon: React.FC<SvgProps>;
  tileListMode: 'list' | 'column';
}

export function MessagesTile({
  navigation,
  title,
  id,
  Icon,
  tileListMode,
}: Props) {
  const hasUnread = useHasUnread(id);

  return (
    <Tile
      id={id}
      key={id}
      title={title}
      testID={tID('message-tile')}
      Icon={Icon}
      showBadge={hasUnread}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          tileId: id,
        });
      }}
      tileListMode={tileListMode}
    />
  );
}

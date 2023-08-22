import React from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { useUser, useHasNewMessagesFromUsers } from '../../hooks';
import { useIcons } from '../BrandConfigProvider';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { tID } from '../TrackTile/common/testID';

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
  const { data, isLoading: loadingUser } = useUser();
  const { MessageCircle } = useIcons();
  const { userIds, isLoading } = useHasNewMessagesFromUsers({
    currentUserId: data?.id,
    userIds: recipientsUserIds,
  });

  if (isLoading || loadingUser) {
    return <ActivityIndicatorView />;
  }

  return (
    <Tile
      id={id}
      key={id}
      title={title}
      testID={tID('message-tile')}
      Icon={MessageCircle}
      showBadge={userIds.length > 0}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          recipientsUserIds: recipientsUserIds,
        });
      }}
    />
  );
}

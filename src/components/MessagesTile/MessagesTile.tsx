import React, { useCallback } from 'react';
import { Tile } from '../tiles/Tile';
import { HomeStackScreenProps } from '../../navigators';
import { useIcons } from '../BrandConfigProvider';
import { tID } from '../TrackTile/common/testID';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { useFocusEffect } from '@react-navigation/native';
import { useNotificationManager } from '../../hooks/useNotificationManager';

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
  const { MessageCircle } = useIcons();
  const { unreadMessagesUserIds } = useUnreadMessages();
  const { setNotificationsRead } = useNotificationManager();

  // TODO: This works for tracking new unread messages now but a refactor
  // to track the privatePosts separately from general notifications will
  // be required once the notifications tab is setup to show a badge
  useFocusEffect(
    useCallback(() => {
      return () => setNotificationsRead();
    }, [setNotificationsRead]),
  );

  return (
    <Tile
      id={id}
      key={id}
      title={title}
      testID={tID('message-tile')}
      Icon={MessageCircle}
      showBadge={unreadMessagesUserIds && unreadMessagesUserIds.length > 0}
      onPress={() => {
        navigation.navigate('Home/Messages', {
          recipientsUserIds: recipientsUserIds,
        });
      }}
    />
  );
}

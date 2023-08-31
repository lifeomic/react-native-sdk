import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useStyles } from '../hooks/useStyles';
import { Badge, Divider, List } from 'react-native-paper';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  ScrollView,
  View,
  ViewStyle,
} from 'react-native';
import { GiftedAvatar, User as GiftedUser } from 'react-native-gifted-chat';
import { createStyles } from '../components/BrandConfigProvider';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { chunk, compact, orderBy } from 'lodash';
import { useLookupUsers } from '../hooks/Circles/usePrivatePosts';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { tID } from '../common/testID';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useNotificationManager } from '../hooks/useNotificationManager';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../hooks/useUser';

type User = GiftedUser & { id: string; name: string };

export function MessageScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Messages'>) {
  const { recipientsUserIds } = route.params;
  const { data: currentUser } = useUser();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('messages-title', 'My Messages'),
    });
  }, [navigation]);

  const { styles } = useStyles(defaultStyles);
  const [scrollIndex, setScrollIndex] = useState<number>(0);

  // Get userIds that have sent new messages
  const { unreadMessagesUserIds: unreadUserIds } = useUnreadMessages();

  // Sort recipientsList by unread messages
  const sortedList = useMemo(
    () =>
      orderBy(
        recipientsUserIds,
        (userId) => unreadUserIds?.includes(userId),
        'desc',
      ),
    [unreadUserIds, recipientsUserIds],
  );

  // Break-down list of users into smaller chunks
  const recipientsListChunked = useMemo(
    () => chunk(sortedList, 10),
    [sortedList],
  );

  // Use current scroll-index to expand the list of users
  // in view up to the maximum
  const usersInView = useMemo(
    () =>
      compact(
        recipientsListChunked.flatMap((users, index) => {
          if (index <= scrollIndex) {
            return users;
          }
        }),
      ),
    [recipientsListChunked, scrollIndex],
  );

  // Construct object to identify which user
  // queries should be enabled
  const userQueryList = useMemo(
    () =>
      sortedList.map((userId) => ({
        userId,
        enabled: usersInView.includes(userId),
      })),
    [sortedList, usersInView],
  );

  // Get user details (picture/displayName) for usersInView
  const userQueries = useLookupUsers(userQueryList);
  const userDetailsList: User[] = useMemo(
    () =>
      compact(
        userQueries.map(({ data: userData }) => {
          if (!userData || userData?.user?.userId === currentUser?.id) {
            return;
          }

          return {
            _id: userData.user.userId,
            id: userData.user.userId,
            name: userData.user.profile.displayName,
            avatar: userData.user.profile.picture,
          };
        }),
      ),
    [currentUser?.id, userQueries],
  );

  // TODO: This works for tracking new unread messages now but a refactor
  // to track the privatePosts separately from general notifications will
  // be required once the notifications tab is setup to show a badge
  const { setNotificationsRead } = useNotificationManager();
  useFocusEffect(
    useCallback(() => {
      return () => setNotificationsRead();
    }, [setNotificationsRead]),
  );

  const handlePostTapped = useCallback(
    (userId: string, displayName: string) => () => {
      navigation.navigate('Home/DirectMessage', {
        recipientUserId: userId,
        displayName,
      });
    },
    [navigation],
  );

  const renderLeft = useCallback(
    (props: { style: ViewStyle }, user: User) => (
      <View style={props.style}>
        <GiftedAvatar user={user} textStyle={{ fontWeight: '500' }} />
      </View>
    ),
    [],
  );

  const renderRight = useCallback(
    (user: User) =>
      unreadUserIds?.includes(user.id) && (
        <Badge
          size={12}
          style={styles.badgeView}
          testID={tID('unread-badge')}
        />
      ),
    [styles.badgeView, unreadUserIds],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (
        event.nativeEvent.contentOffset.y +
          event.nativeEvent.layoutMeasurement.height >=
        event.nativeEvent.contentSize.height
      ) {
        if (recipientsListChunked.length > scrollIndex) {
          // Add new users to view on scroll
          setScrollIndex(scrollIndex + 1);
        }
      }
    },
    [scrollIndex, recipientsListChunked.length],
  );

  return (
    <View style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
        onScroll={handleScroll}
      >
        {userDetailsList?.map((user) => (
          <TouchableOpacity
            key={`message-${user.id}`}
            onPress={handlePostTapped(user.id, user.name)}
            activeOpacity={0.6}
          >
            <List.Item
              testID={tID('user-list-item')}
              titleStyle={styles.listItemText}
              style={styles.listItemView}
              left={(props) => renderLeft(props, user)}
              title={user.name}
              right={() => renderRight(user)}
            />
            <Divider />
          </TouchableOpacity>
        ))}
        {userQueries.some((query) => {
          return query.isInitialLoading;
        }) && <ActivityIndicatorView />}
      </ScrollView>
    </View>
  );
}

const defaultStyles = createStyles('MessageScreen', (theme) => {
  return {
    rootView: {
      backgroundColor: theme.colors.elevation.level1,
      minHeight: '100%',
      maxHeight: '100%',
    },
    scrollView: { minHeight: '100%' },
    listItemView: {
      backgroundColor: theme.colors.elevation.level3,
    },
    listItemText: {
      ...theme.fonts.titleMedium,
    },
    userIconView: {
      marginLeft: theme.spacing.extraSmall,
    },
    badgeView: {},
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

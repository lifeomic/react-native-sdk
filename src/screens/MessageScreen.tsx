import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useStyles } from '../hooks';
import { Avatar, Badge, Divider, List } from 'react-native-paper';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import { ScrollView, View } from 'react-native';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { chunk, compact, orderBy } from 'lodash';
import { useLookupUsers } from '../hooks/Circles/usePrivatePosts';
import { ActivityIndicatorView } from '../components';
import { tID } from '../common';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

export function MessageScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Messages'>) {
  const { recipientsUserIds } = route.params;
  const { styles } = useStyles(defaultStyles);
  const { User } = useIcons();

  const [scrollIndex, setScrollIndex] = useState<number>(0);

  // Users that have sent new messages
  const { unreadMessagesUserIds: unreads } = useUnreadMessages();

  // Sort recipientsList by unreads
  const sortedList = useMemo(
    () =>
      orderBy(recipientsUserIds, (userId) => unreads?.includes(userId), 'desc'),
    [unreads, recipientsUserIds],
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
  const prioritizedList = useMemo(
    () =>
      recipientsUserIds.map((userId) => ({
        userId,
        enabled: usersInView.includes(userId),
      })),
    [recipientsUserIds, usersInView],
  );

  // Get user details (picture/displayName) for usersInView
  const userQueries = useLookupUsers(prioritizedList);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('messages-title', 'My Messages'),
    });
  }, [navigation]);

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
    (picture?: string) =>
      picture ? (
        <Avatar.Image
          source={{ uri: picture }}
          style={styles.userIconView}
          size={42}
        />
      ) : (
        <List.Icon icon={User} style={styles.userIconView} />
      ),
    [User, styles.userIconView],
  );

  const renderRight = useCallback(
    (userId: string) =>
      unreads?.includes(userId) && (
        <Badge
          size={12}
          style={styles.badgeView}
          testID={tID('unread-badge')}
        />
      ),
    [styles.badgeView, unreads],
  );

  const userList = useMemo(
    () =>
      compact(
        userQueries.map(({ data: userData }) => {
          if (!userData) {
            return;
          }

          return {
            userId: userData.user.userId,
            displayName: userData.user.profile.displayName,
            picture: userData.user.profile.picture,
          };
        }),
      ),
    [userQueries],
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
        {userList?.map((user) => (
          <TouchableOpacity
            key={`message-${user.userId}`}
            onPress={handlePostTapped(user.userId, user.displayName)}
            activeOpacity={0.6}
          >
            <List.Item
              testID={tID('user-list-item')}
              titleStyle={styles.listItemText}
              style={styles.listItemView}
              left={() => renderLeft(user.picture)}
              title={user.displayName}
              right={() => renderRight(user.userId)}
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

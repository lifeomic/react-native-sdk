import React, { useCallback, useLayoutEffect } from 'react';
import { useHasNewMessagesFromUsers, useStyles, useUser } from '../hooks';
import { Avatar, Badge, Divider, List } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { ScrollView, View } from 'react-native';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { compact, orderBy } from 'lodash';
import { useLookupUsers } from '../hooks/Circles/usePrivatePosts';
import { ActivityIndicatorView } from '../components';
import { tID } from '../common';

export function MessageScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Messages'>) {
  const { recipientsUserIds } = route.params;
  const { styles } = useStyles(defaultStyles);
  const { data, isLoading: userLoading } = useUser();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('messages-title', 'My Messages'),
    });
  }, [navigation]);

  const { User } = useIcons();

  const userQueries = useLookupUsers(recipientsUserIds);
  const { userIds, isLoading } = useHasNewMessagesFromUsers({
    currentUserId: data?.id,
    userIds: recipientsUserIds,
  });

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
      userIds?.includes(userId) && (
        <Badge
          size={12}
          style={styles.badgeView}
          testID={tID('unread-badge')}
        />
      ),
    [styles.badgeView, userIds],
  );

  if (
    isLoading ||
    userQueries.some((query) => query.isLoading) ||
    userLoading
  ) {
    return (
      <ActivityIndicatorView
        message={t('loading-messages-screen', 'Loading messages')}
      />
    );
  }

  const userList = compact(
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
  );

  const prioritizedUserList = orderBy(
    userList,
    (user) => userIds.includes(user.userId),
    'desc',
  );

  return (
    <View style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {prioritizedUserList?.map((user) => (
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

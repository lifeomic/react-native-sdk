import React, { useCallback, useLayoutEffect } from 'react';
import { useStyles } from '../hooks/useStyles';
import { Badge, Divider, List, Button } from 'react-native-paper';
import { TouchableOpacity, ScrollView, View, ViewStyle } from 'react-native';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { GiftedAvatar, User as GiftedUser } from 'react-native-gifted-chat';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { tID } from '../common/testID';
import { useMyMessages } from '../hooks/useMyMessages';
type User = GiftedUser & { id: string; name: string };

export function MessageScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/Messages'>) {
  const { tileId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('messages-title', 'My Messages'),
    });
  }, [navigation]);

  const { styles } = useStyles(defaultStyles);
  const { User } = useIcons();
  const { userDetailsList, fetchNextPage, hasNextPage, isLoading } =
    useMyMessages(tileId);

  const handlePostTapped = useCallback(
    (userId: string | undefined, displayName?: string) => () => {
      if (userId) {
        navigation.navigate('Home/DirectMessage', {
          recipientUserId: userId,
          displayName,
        });
      }
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
    [styles.badgeView],
  );

  return (
    <View style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
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
              left={() => renderLeft(user.picture)}
              title={user.displayName}
              right={() => renderRight(user.isUnread)}
            />
            <Divider />
          </TouchableOpacity>
        ))}
        {isLoading ? (
          <ActivityIndicatorView />
        ) : (
          hasNextPage && (
            <Button
              onPress={() => fetchNextPage()}
              mode="elevated"
              style={styles.loadMoreButton}
              labelStyle={styles.loadMoreText}
            >
              {t('load-more', 'Load more')}
            </Button>
          )
        )}
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
    loadMoreButton: {},
    loadMoreText: {},
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

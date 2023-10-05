import React, { useCallback, useLayoutEffect } from 'react';
import { useStyles } from '../hooks/useStyles';
import { Badge, Divider, List, Button } from 'react-native-paper';
import { TouchableOpacity, ScrollView, View, ViewStyle } from 'react-native';
import { createStyles } from '../components/BrandConfigProvider';
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
    (isUnread: boolean) =>
      isUnread && (
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
            key={`message-${user.userId}`}
            onPress={handlePostTapped(user.userId, user.displayName)}
            activeOpacity={0.6}
          >
            <List.Item
              testID={tID('user-list-item')}
              titleStyle={styles.listItemText}
              style={styles.listItemView}
              descriptionStyle={styles.listItemSubtitle}
              left={(props) =>
                renderLeft(props, {
                  _id: user.userId,
                  id: user.userId,
                  name: user.displayName,
                  avatar: user.picture,
                })
              }
              title={user.displayName}
              description={user.message}
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
    listItemSubtitle: {
      ...theme.fonts.titleSmall,
    },
    userIconView: {
      marginLeft: theme.spacing.extraSmall,
    },
    badgeView: {
      alignSelf: 'center',
    },
    loadMoreButton: {},
    loadMoreText: {},
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

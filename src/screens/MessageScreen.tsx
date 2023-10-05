import React, { useCallback, useLayoutEffect } from 'react';
import { useStyles } from '../hooks/useStyles';
import { Divider, List, Button, Text, Badge } from 'react-native-paper';
import { TouchableOpacity, ScrollView, View, ViewStyle } from 'react-native';
import { createStyles } from '../components/BrandConfigProvider';
import { GiftedAvatar, User as GiftedUser } from 'react-native-gifted-chat';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { tID } from '../common/testID';
import { useMyMessages } from '../hooks/useMyMessages';
import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInSeconds,
} from 'date-fns';

type User = GiftedUser & { id: string; name: string; isUnread: boolean };

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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginLeft: 8,
        }}
      >
        {
          <Badge
            size={10}
            style={[
              styles.badgeView,
              user.isUnread
                ? styles.badgeColor?.enabled
                : styles.badgeColor?.disabled,
            ]}
            testID={tID('unread-badge')}
          />
        }
        <View
          style={
            user.isUnread
              ? [props.style, styles.newMessageIconView]
              : props.style
          }
        >
          <GiftedAvatar user={user} textStyle={{ fontWeight: '500' }} />
        </View>
      </View>
    ),
    [
      styles.badgeColor?.disabled,
      styles.badgeColor?.enabled,
      styles.badgeView,
      styles.newMessageIconView,
    ],
  );

  const renderRight = useCallback(
    (messageTime: string) => (
      <View style={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
        <Text style={styles.listItemTimeText}>
          {formatMessageTime(messageTime)}
        </Text>
      </View>
    ),
    [styles.listItemTimeText],
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
              descriptionNumberOfLines={1}
              descriptionStyle={
                user.hasUnread
                  ? [styles.listItemSubtitle, styles.newMessageText]
                  : styles.listItemSubtitle
              }
              left={(props) =>
                renderLeft(props, {
                  _id: user.userId,
                  id: user.userId,
                  name: user.displayName,
                  avatar: user.picture,
                  isUnread: user.hasUnread,
                })
              }
              title={user.displayName}
              description={`${user.isCreatedBySelf ? styles.selfPrefix : ''} ${
                user.lastMessage
              }`}
              right={() => renderRight(user.lastMessageTime)}
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
      paddingRight: 0,
      marginRight: -10,
    },
    badgeColor: {
      enabled: {
        backgroundColor: theme.colors.primary,
      },
      disabled: {
        backgroundColor: 'transparent',
      },
    },
    loadMoreButton: {},
    loadMoreText: {},
    listItemTimeText: { paddingLeft: 15 },
    newMessageIconView: {
      marginRight: -1,
      borderWidth: 2,
      borderColor: theme.colors.text,
      borderRadius: 32,
    },
    newMessageText: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    selfPrefix: t('messages-self-prefix', 'You: '),
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

const formatMessageTime = (timestamp?: string) => {
  if (!timestamp) {
    return '';
  }

  const currentDate = new Date();
  const date = new Date(timestamp);

  const secondsDifference = differenceInSeconds(currentDate, date);
  const minutesDifference = differenceInMinutes(currentDate, date);
  const differenceHours = differenceInHours(currentDate, date);
  const daysDifference = differenceInDays(currentDate, date);

  if (secondsDifference < 60) {
    return 'now';
  } else if (minutesDifference === 1) {
    return `${minutesDifference}min`;
  } else if (minutesDifference < 60) {
    return `${minutesDifference}mins`;
  } else if (differenceHours === 1) {
    return `${differenceHours}hr`;
  } else if (differenceHours < 24) {
    return `${differenceHours}hrs`;
  } else if (daysDifference === 1) {
    return `${daysDifference}day`;
  } else if (daysDifference < 3) {
    return `${daysDifference}days`;
  } else {
    return format(date, 'MMM d');
  }
};

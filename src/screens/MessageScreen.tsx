import React, { useCallback, useLayoutEffect } from 'react';
import { useStyles } from '../hooks/useStyles';
import {
  Divider,
  List,
  Button,
  Text,
  Badge,
  IconButton,
} from 'react-native-paper';
import { TouchableOpacity, ScrollView, View } from 'react-native';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { GiftedAvatar } from 'react-native-gifted-chat';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { tID } from '../common/testID';
import {
  format,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInSeconds,
} from 'date-fns';
import { useInfiniteConversations } from '../hooks/useConversations';
import { useUser } from '../hooks';
import { useProfilesForTile } from '../hooks/useMessagingProfiles';
import { User } from '../types';
import { ParamListBase } from '@react-navigation/native';
import { DirectMessageParams } from './DirectMessagesScreen';
import {
  ScreenParamTypes as BaseScreenParamTypes,
  toRouteMap,
} from './utils/stack-helpers';

export type MessageTileParams = {
  tileId: string;
};

type SubRoutesParamList = {
  DirectMessageScreen: DirectMessageParams;
};

type ScreenParamTypes<ParamList extends ParamListBase> = BaseScreenParamTypes<
  MessageTileParams,
  ParamList,
  SubRoutesParamList
>;

export function MessageScreen<ParamList extends ParamListBase>({
  navigation,
  route,
  routeMapIn,
}: ScreenParamTypes<ParamList>['ComponentProps']) {
  const { tileId } = route.params;
  const routeMap = toRouteMap(routeMapIn);
  const { all, others } = useProfilesForTile(tileId);
  const { data: userData } = useUser();

  const { Edit2 } = useIcons();
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteConversations();

  const iconButton = useCallback(
    () => (
      <IconButton
        icon={Edit2}
        onPress={() => navigation.navigate('Home/ComposeMessage', { tileId })}
      />
    ),
    [Edit2, navigation, tileId],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('messages-title', 'Messages'),
      headerRight: iconButton,
    });
  }, [iconButton, navigation]);

  const { styles } = useStyles(defaultStyles);

  const handlePostTapped = useCallback(
    (tappedUsers: User[], conversationId: string) => () => {
      navigation.navigate(routeMap.DirectMessageScreen, {
        users: tappedUsers,
        conversationId,
      });
    },
    [navigation, routeMap.DirectMessageScreen],
  );

  const renderLeft = useCallback(
    (selectedProfiles: User[], hasUnread: boolean) => {
      if (selectedProfiles && selectedProfiles.length > 0) {
        return (
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
                  hasUnread
                    ? styles.badgeColor?.enabled
                    : styles.badgeColor?.disabled,
                ]}
                testID={
                  hasUnread ? tID('unread-badge') : tID('unread-badge-hidden')
                }
              />
            }
            <View>
              {
                // TODO: Combine multiple GiftedAvatars
              }
              <GiftedAvatar
                key={selectedProfiles[0].id}
                user={{
                  name: selectedProfiles[0].profile.displayName,
                  avatar: selectedProfiles[0].profile.picture,
                  _id: selectedProfiles[0].id,
                }}
                textStyle={{ fontWeight: '500' }}
              />
            </View>
          </View>
        );
      }
    },
    [styles.badgeColor?.disabled, styles.badgeColor?.enabled, styles.badgeView],
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

  const conversations = data?.pages?.flatMap((page) =>
    page.conversations.edges.flatMap((edge) => edge.node),
  );

  return (
    <View style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {conversations?.map((node) => (
          <TouchableOpacity
            key={`message-${node.conversationId}`}
            onPress={handlePostTapped(
              all.filter((profile) => node.userIds.includes(profile.id)),
              node.conversationId,
            )}
            activeOpacity={0.6}
          >
            <List.Item
              testID={tID('user-list-item')}
              titleStyle={styles.listItemText}
              style={styles.listItemView}
              descriptionNumberOfLines={1}
              descriptionStyle={
                node
                  ? [styles.listItemSubtitleText, styles.newMessageText]
                  : styles.listItemSubtitleText
              }
              left={() =>
                renderLeft(
                  others.filter((profile) => node.userIds.includes(profile.id)),
                  node.hasUnread,
                )
              }
              title={others
                .filter((profile) => node.userIds.includes(profile.id))
                .map((profile) => profile.profile.displayName)
                .join(', ')}
              description={
                node.latestMessageUserId === userData?.id
                  ? t('message-preview-prefixed', {
                      defaultValue: 'You: {{messageText}}',
                      messageText: node.latestMessageText,
                    })
                  : node.latestMessageText
              }
              right={() => renderRight(node.latestMessageTime)}
            />
            <Divider style={styles.listItemDividerView} />
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

export const createMessageScreen = <ParamList extends ParamListBase>(
  routeMap: ScreenParamTypes<ParamList>['RouteMap'],
) => {
  return (props: ScreenParamTypes<ParamList>['ScreenProps']) => (
    <MessageScreen {...props} routeMapIn={routeMap} />
  );
};

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
    listItemSubtitleText: {
      ...theme.fonts.titleSmall,
    },
    listItemDividerView: {},
    userIconView: {
      marginLeft: theme.spacing.extraSmall,
    },
    badgeView: {
      alignSelf: 'center',
      paddingRight: 0,
      marginRight: 10,
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

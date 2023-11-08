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
import {
  useInfiniteConversations,
  useLeaveConversation,
} from '../hooks/useConversations';
import { useUser } from '../hooks';
import { useProfilesForTile } from '../hooks/useMessagingProfiles';
import { User } from '../types';
import { ParamListBase } from '@react-navigation/native';
import { DirectMessageParams } from './DirectMessagesScreen';
import { ComposeMessageParams } from './ComposeMessageScreen';
import {
  ScreenParamTypes as BaseScreenParamTypes,
  toRouteMap,
} from './utils/stack-helpers';
import compact from 'lodash/compact';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export type MessageTileParams = {
  tileId: string;
};

type SubRoutesParamList = {
  DirectMessageScreen: DirectMessageParams;
  ComposeMessageScreen: ComposeMessageParams;
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
  const { data: profiles } = useProfilesForTile(tileId);
  const { data: userData } = useUser();
  const all = compact(profiles);
  const others = all.filter((profile) => profile.id !== userData?.id);
  const { mutateAsync } = useLeaveConversation();

  const { Edit2 } = useIcons();
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteConversations();

  const iconButton = useCallback(
    () => (
      <IconButton
        icon={Edit2}
        onPress={() =>
          navigation.navigate(routeMap.ComposeMessageScreen, { tileId })
        }
      />
    ),
    [Edit2, navigation, tileId, routeMap.ComposeMessageScreen],
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

  const handleDeleteTapped = useCallback(
    (conversationId: string) => () => {
      mutateAsync({ conversationId });
    },
    [mutateAsync],
  );

  const renderLeft = useCallback(
    (selectedProfiles: User[], hasUnread: boolean) => {
      if (selectedProfiles && selectedProfiles.length > 0) {
        return (
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              maxWidth: 75,
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
            <MultiGiftedAvatar profiles={selectedProfiles} />
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

  const rightSwipeActions = (conversationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteButtonView}
        onPress={handleDeleteTapped(conversationId)}
      >
        <Text style={styles.deleteButtonLabel}>
          {t('delete-button', 'Delete')}
        </Text>
      </TouchableOpacity>
    );
  };

  const conversations = data?.pages?.flatMap((page) =>
    page.conversations.edges
      .flatMap((edge) => edge.node)
      // Conversations that contain users not part of this message tile should be hidden
      .filter((node) =>
        node.userIds.every((id) => profiles?.find((p) => p.id === id)),
      ),
  );

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {conversations?.map((node) => (
          <Swipeable
            key={`message-${node.conversationId}`}
            renderRightActions={() => rightSwipeActions(node.conversationId)}
          >
            <TouchableOpacity
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
                    others.filter((profile) =>
                      node.userIds.includes(profile.id),
                    ),
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
          </Swipeable>
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
    </GestureHandlerRootView>
  );
}

export const createMessageScreen = <ParamList extends ParamListBase>(
  routeMap: ScreenParamTypes<ParamList>['RouteMap'],
) => {
  return (props: ScreenParamTypes<ParamList>['ScreenProps']) => (
    <MessageScreen {...props} routeMapIn={routeMap} />
  );
};

type MultiGiftedAvatarProps = {
  profiles: User[];
};

const MultiGiftedAvatar = ({ profiles }: MultiGiftedAvatarProps) => {
  const { styles } = useStyles(defaultStyles);
  const userCount = profiles.length;
  const paddedProfiles =
    profiles.length === 2
      ? [
          profiles[0],
          { id: '#pad1', profile: {} },
          { id: '#pad2', profile: {} },
          profiles[1],
        ]
      : profiles.splice(0, 3); // Max of 3 icons

  return (
    <View
      style={{
        ...styles.multiGiftedAvatarView,
        backgroundColor:
          styles.multiGiftedAvatarColor?.getBackgroundColor?.(userCount),
      }}
    >
      {paddedProfiles.map((profile, i) => (
        <GiftedAvatar
          user={{
            name: profile.profile.displayName,
            avatar: profile.profile.picture,
            _id: profile.id,
          }}
          avatarStyle={{
            ...styles.avatarStyle,
            height: styles.avatarStyle?.getHeight?.(i, userCount),
            width: styles.avatarStyle?.getWidth?.(i, userCount),
            marginHorizontal:
              styles.avatarStyle?.getMarginHorizontal?.(userCount),
            marginVertical: styles.avatarStyle?.getMarginVertical?.(i),
            marginTop: styles.avatarStyle?.getMarginTop?.(i),
            marginLeft: styles.avatarStyle?.getMarginLeft?.(i, userCount),
          }}
          textStyle={{
            ...styles.initialsText,
            fontSize: styles.initialsTextSize?.getFontSize?.(i, userCount),
          }}
        />
      ))}
    </View>
  );
};

const getDiameter = (avatarIndex: number, userCount: number) => {
  if (userCount === 3) {
    return [20, 15, 17][avatarIndex];
  }
  if (userCount === 1) {
    return 40;
  }

  return 20;
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
      backgroundColor: theme.colors.elevation.level0,
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
      marginLeft: 4,
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
    multiGiftedAvatarView: {
      flex: 1,
      flexDirection: 'column',
      flexWrap: 'wrap',
      alignContent: 'center',
      maxHeight: 50,
      maxWidth: 50,
      borderRadius: 64,
      justifyContent: 'center',
    },
    multiGiftedAvatarColor: {
      getBackgroundColor: (userCount: number) =>
        userCount > 1 ? theme.colors.primaryContainer : undefined,
    },
    profileView: {
      flex: 1,
    },
    avatarStyle: {
      borderRadius: 64,
      getHeight: getDiameter,
      getWidth: getDiameter,
      getMarginHorizontal: (userCount: number) => {
        if (userCount === 2) {
          return -2;
        }
        if (userCount === 3) {
          return 0;
        }
      },
      getMarginLeft: (index: number, userCount: number) => {
        if (userCount === 3 && index === 1) {
          return 6;
        }
      },
      getMarginVertical: (index: number) => (index === 0 ? 3 : 0),
      getMarginTop: (index: number) => (index === 0 || index === 2 ? 2 : 0),
    },
    initialsText: {
      fontWeight: '500',
    },
    initialsTextSize: {
      getFontSize: (index: number, count: number) =>
        getDiameter(index, count) / 2,
    deleteButtonView: {
      backgroundColor: theme.colors.error,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    deleteButtonLabel: {
      paddingHorizontal: 10,
      fontWeight: '500',
      paddingVertical: 20,
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

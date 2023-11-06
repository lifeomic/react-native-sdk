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
import { ComposeMessageParams } from './ComposeMessageScreen';
import {
  ScreenParamTypes as BaseScreenParamTypes,
  toRouteMap,
} from './utils/stack-helpers';
import compact from 'lodash/compact';

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

  const conversations = data?.pages?.flatMap((page) =>
    page.conversations.edges
      .flatMap((edge) => edge.node)
      // Conversations that contain users not part of this message tile should be hidden
      .filter((node) =>
        node.userIds.every((id) => profiles?.find((p) => p.id === id)),
      ),
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
              (profiles ?? []).filter((profile) =>
                node.userIds.includes(profile.id),
              ),
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

type MultiGiftedAvatarProps = {
  profiles: User[];
};

const MultiGiftedAvatar = ({ profiles }: MultiGiftedAvatarProps) => {
  const { styles } = useStyles(defaultStyles);
  const diameter = profiles.length < 2 ? 40 : 20;
  const fontSize = diameter / 2;
  const adjustments = profiles.length === 2 ? -8 : 0;
  const paddedProfiles =
    profiles.length === 2
      ? [
          profiles[0],
          { id: '#pad1', profile: {} },
          { id: '#pad2', profile: {} },
          profiles[1],
        ]
      : profiles.splice(0, 4); // Max of 4 icons

  return (
    <View style={styles.multiGiftedAvatarView}>
      {paddedProfiles.map((profile, i) => (
        <View key={profile.id} style={styles.profileView}>
          <GiftedAvatar
            user={{
              name: profile.profile.displayName,
              avatar: profile.profile.picture,
              _id: profile.id,
            }}
            avatarStyle={{
              height: diameter,
              width: diameter,
              borderRadius: 64,
              marginLeft: i === 3 ? adjustments : 0,
            }}
            textStyle={{ fontWeight: '500', fontSize: fontSize }}
          />
        </View>
      ))}
    </View>
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
    multiGiftedAvatarView: {
      flex: 1,
      flexWrap: 'wrap',
      maxHeight: 40,
      marginRight: 50,
    },
    profileView: {
      height: 20,
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

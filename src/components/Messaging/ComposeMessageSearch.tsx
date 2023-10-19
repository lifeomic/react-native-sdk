import React, { useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, ViewStyle } from 'react-native';
import { GiftedAvatar, User as GiftedUser } from 'react-native-gifted-chat';
import { Divider, List } from 'react-native-paper';
import { tID } from '../TrackTile/common/testID';
import { UserProfile, useAppConfig, useStyles } from '../../hooks';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { createStyles } from '../../components/BrandConfigProvider';

type User = GiftedUser & { id: string; name: string; isUnread: boolean };

type Props = {
  tileId: string;
  onUserClicked: (userProfile: UserProfile) => void;
  searchTerm: string;
  selectedUserIds: string[];
};

export const ComposeMessageSearch = ({
  tileId,
  onUserClicked,
  searchTerm,
  selectedUserIds,
}: Props) => {
  console.log(selectedUserIds);
  const { data, isLoading } = useAppConfig();
  const { styles } = useStyles(defaultStyles);
  const messageTiles = data?.homeTab?.messageTiles;
  const tile = messageTiles?.find((messageTile) => messageTile.id === tileId);
  const users = tile?.userProfiles?.filter(
    (userProfile) => !selectedUserIds.includes(userProfile.id),
  );
  const filteredList = searchTerm
    ? users?.filter(
        (user) =>
          user?.profile.displayName?.includes(searchTerm) ||
          user.id.includes(searchTerm),
      )
    : [];

  const renderLeft = useCallback(
    (props: { style: ViewStyle }, user: User) => (
      <View style={styles.leftIconView}>
        <View style={props.style}>
          <GiftedAvatar user={user} textStyle={{ fontWeight: '500' }} />
        </View>
      </View>
    ),
    [styles.leftIconView],
  );

  return (
    <View style={styles.rootView}>
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {filteredList?.map((user) => (
          <TouchableOpacity
            key={`message-${user.id}`}
            onPress={() => onUserClicked(user)}
            activeOpacity={0.6}
          >
            <List.Item
              testID={tID('user-list-item')}
              titleStyle={styles.listItemText}
              style={styles.listItemView}
              left={(props) =>
                renderLeft(props, {
                  _id: user.id,
                  id: user.id,
                  name: user.profile.displayName ?? user.id,
                  avatar: user.profile.picture,
                  isUnread: false,
                })
              }
              title={user.profile.displayName}
            />
            <Divider style={styles.listItemDividerView} />
          </TouchableOpacity>
        ))}
        {isLoading && <ActivityIndicatorView />}
      </ScrollView>
    </View>
  );
};

const defaultStyles = createStyles('ComposeMessageSearch', (theme) => {
  return {
    rootView: {
      backgroundColor: theme.colors.elevation.level1,
      flexShrink: 1,
    },
    scrollView: { minHeight: '80%' },
    listItemView: {
      backgroundColor: theme.colors.elevation.level3,
    },
    listItemText: {
      ...theme.fonts.titleMedium,
    },
    listItemDividerView: {},
    leftIconView: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginLeft: 8,
    },
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

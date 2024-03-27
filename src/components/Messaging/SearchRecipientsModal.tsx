import React, { useCallback, useState } from 'react';
import {
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { GiftedAvatar, User as GiftedUser } from 'react-native-gifted-chat';
import { Button, Divider, List, Searchbar, Text } from 'react-native-paper';
import { tID } from '../TrackTile/common/testID';
import { useStyles, useUser } from '../../hooks';
import { createStyles, useIcons } from '../BrandConfigProvider';
import {
  UserProfile,
  useMessagingProfiles,
} from '../../hooks/useMessagingProfiles';
import compact from 'lodash/compact';
import { t } from 'i18next';

type User = GiftedUser & { id: string; name: string; isUnread: boolean };

type Props = {
  userIds: string[];
  onProfileSelected: (profile: UserProfile) => void;
  selectedProfiles: UserProfile[];
  hideSelf: () => void;
};

export const SearchRecipientsModal = ({
  userIds,
  onProfileSelected,
  selectedProfiles,
  hideSelf,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const onChangeSearch = (query: string) => setSearchQuery(query);
  const selectedUserIds = selectedProfiles.map((p) => p.id);

  const { Search, ClearList } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const { data: profiles } = useMessagingProfiles(userIds);
  const { data: userData } = useUser();
  const others = compact(profiles).filter(
    (profile) => profile.id !== userData?.id,
  );

  const filteredOthers = others.filter((p) => !selectedUserIds.includes(p.id));

  const filteredList = searchQuery
    ? filteredOthers?.filter(
        (profile) =>
          profile?.profile.displayName?.includes(searchQuery) ||
          profile.id.includes(searchQuery),
      )
    : filteredOthers;

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
      <Searchbar
        style={styles.searchbarView}
        onChangeText={onChangeSearch}
        value={searchQuery}
        placeholder={t('search-patient', 'Search by Name')}
        icon={Search}
        clearIcon={ClearList}
        testID={tID('search-bar')}
      />
      {others.length < 1 && (
        <View>
          <Text style={{ textAlign: 'center' }}>
            {t(
              'no-recipients-message',
              'No available message recipients. \nYou must be added to a messaging group to use this feature. Ask your administrator for more information.',
            )}
          </Text>
        </View>
      )}
      <ScrollView
        scrollEventThrottle={400}
        contentContainerStyle={styles.scrollView}
      >
        {filteredList?.map((user) => (
          <TouchableOpacity
            key={`message-${user.id}`}
            onPress={() => {
              onProfileSelected(user);
            }}
            activeOpacity={0.6}
          >
            <List.Item
              testID={tID('user-list-item')}
              titleStyle={styles.listItemText}
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
      </ScrollView>
      <Button
        mode="contained"
        style={styles.doneButton}
        labelStyle={styles.doneButtonLabel}
        onPress={() => hideSelf()}
      >
        {t('next-button', 'Done')}
      </Button>
    </View>
  );
};

const defaultStyles = createStyles('SearchRecipientsModal', (theme) => {
  return {
    rootView: {
      backgroundColor: theme.colors.elevation.level1,
      height: Platform.select({ android: '90%', default: '100%' }),
    },
    scrollView: { minHeight: '80%' },
    listItem: {
      enabledStyle: {
        backgroundColor: theme.colors.elevation.level3,
      },
      disabledStyle: {
        backgroundColor: theme.colors.onSurfaceDisabled,
      },
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
    searchbarView: { margin: 16 },
    doneButton: {
      backgroundColor: theme.colors.primary,
      marginVertical: 16,
      marginRight: 16,
      alignSelf: 'center',
    },
    doneButtonLabel: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      textAlignVertical: 'center',
    },
  };
});

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

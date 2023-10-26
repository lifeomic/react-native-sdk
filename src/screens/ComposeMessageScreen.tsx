import React, { useLayoutEffect, useState } from 'react';
import { Searchbar, Chip, Text, Divider } from 'react-native-paper';
import { ComposeMessageSearch } from '../components/Messaging/ComposeMessageSearch';
import { View } from 'react-native';
import { t } from 'i18next';
import { HomeStackScreenProps } from '../navigators/types';
import { createStyles, useIcons } from '../components';
import { ComposeInputBar } from '../components/Messaging/ComposeInputBar';
import { UserProfile } from '../hooks/useAppConfig';
import { useStyles } from '../components/BrandConfigProvider/styles/StylesProvider';
import { tID } from '../components/TrackTile/common/testID';

export function ComposeMessageScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/ComposeMessage'>) {
  const { tileId } = route.params;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const onChangeSearch = (query: string) => setSearchQuery(query);
  const [selectedProfiles, setSelectedProfiles] = useState<UserProfile[]>([]);
  const { styles } = useStyles(defaultStyles);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New Message',
    });
  }, [navigation]);

  const { Search, ClearList } = useIcons();

  return (
    <View style={styles.rootContainer}>
      <Divider style={styles.dividerView} />
      <View style={styles.toUsersView}>
        <Text>To: </Text>
        {selectedProfiles.map((userProfile) => (
          <Chip
            key={userProfile.id}
            style={styles.chipView}
            testID={tID('chip')}
          >
            {userProfile.profile.displayName}
          </Chip>
        ))}
      </View>
      <Divider style={styles.dividerView} />
      <Searchbar
        style={styles.searchbarView}
        onChangeText={onChangeSearch}
        value={searchQuery}
        placeholder={t('search-patient', 'Search by Name')}
        icon={Search}
        clearIcon={ClearList}
        testID={tID('search-bar')}
      />
      <ComposeMessageSearch
        searchTerm={searchQuery}
        tileId={tileId}
        onUserClicked={(userProfile) =>
          setSelectedProfiles((currentVal) => [...currentVal, userProfile])
        }
        selectedUserIds={selectedProfiles.map((userProfile) => userProfile.id)}
      />
      <ComposeInputBar users={selectedProfiles} />
    </View>
  );
}

const defaultStyles = createStyles('ComposeMessageScreen', () => ({
  rootContainer: { flex: 1 },
  toUsersView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingBottom: 16,
    paddingLeft: 16,
  },
  chipView: { marginRight: 4, marginBottom: 4 },
  dividerView: { marginBottom: 16 },
  searchbarView: { marginBottom: 16, marginHorizontal: 16 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

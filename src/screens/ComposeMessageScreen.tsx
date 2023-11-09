import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Chip,
  Text,
  Divider,
  IconButton,
  Modal,
  Provider,
  Portal,
} from 'react-native-paper';
import { View } from 'react-native';
import { t } from 'i18next';
import { createStyles, useIcons } from '../components';
import { ComposeInputBar } from '../components/Messaging/ComposeInputBar';
import { useStyles } from '../components/BrandConfigProvider/styles/StylesProvider';
import { tID } from '../components/TrackTile/common/testID';
import { ScreenParamTypes as BaseScreenParamTypes } from './utils/stack-helpers';
import { DirectMessageParams } from './DirectMessagesScreen';
import { ParamListBase } from '@react-navigation/native';
import { useAppConfig } from '../hooks/useAppConfig';
import { UserProfile } from '../hooks/useMessagingProfiles';
import { SearchRecipientsModal } from '../components/Messaging/SearchRecipientsModal';
import { useUser } from '../hooks/useUser';

export type ComposeMessageParams = {
  tileId: string;
};

type SubRoutesParamList = {
  DirectMessageScreen: DirectMessageParams;
};

export type ComposeScreenParamTypes<ParamList extends ParamListBase> =
  BaseScreenParamTypes<ComposeMessageParams, ParamList, SubRoutesParamList>;

export function ComposeMessageScreen<ParamList extends ParamListBase>({
  navigation,
  route,
  routeMapIn,
}: ComposeScreenParamTypes<ParamList>['ComponentProps']) {
  const { tileId } = route.params;
  const [isOpen, setIsOpen] = useState(false);
  const { PlusCircle } = useIcons();
  const [searchUserIds, setSearchUserIds] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<UserProfile[]>([]);
  const { data: appConfig } = useAppConfig();
  const { data: userData } = useUser();
  const messageTile = appConfig?.homeTab?.messageTiles?.find(
    (tile) => tile.id === tileId,
  );
  const { patientUserIds, providerUserIds, isProvider } = useMemo(() => {
    const providers = messageTile?.providerUserIds ?? [];
    const patients =
      messageTile?.userIds?.filter((id) => !providers?.includes(id)) ?? [];
    return {
      patientUserIds: patients,
      providerUserIds: providers,
      isProvider: !!(userData?.id && providers.includes(userData?.id)),
    };
  }, [messageTile?.providerUserIds, messageTile?.userIds, userData?.id]);

  const selectedProviders = selectedProfiles.filter((profile) =>
    providerUserIds.includes(profile.id),
  );
  const selectedPatients = selectedProfiles.filter(
    (profile) => !providerUserIds.includes(profile.id),
  );
  const addSelectedProfile = (profile: UserProfile) => {
    setSelectedProfiles((currentProfiles) => [...currentProfiles, profile]);
  };

  const { styles } = useStyles(defaultStyles);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('compose-new-message-title', 'New Message'),
    });
  }, [navigation]);

  useEffect(() => {
    if (
      selectedPatients.length > 0 &&
      searchUserIds === patientUserIds &&
      isOpen
    ) {
      setIsOpen(false);
    }
  }, [isOpen, patientUserIds, searchUserIds, selectedPatients]);

  return (
    <Provider>
      <Portal>
        <Modal visible={isOpen} onDismiss={() => setIsOpen(false)}>
          <SearchRecipientsModal
            userIds={searchUserIds}
            onProfileSelected={addSelectedProfile}
            selectedProfiles={selectedProfiles}
          />
        </Modal>
      </Portal>
      <View style={styles.rootContainer}>
        <Divider style={styles.dividerView} />
        <View style={styles.descriptionView}>
          <Text style={styles.toProvidersLabel}>
            {t('provider-list-label', {
              defaultValue: 'Select Providers',
            })}
          </Text>
        </View>
        <View style={styles.toUsersView}>
          <IconButton
            icon={PlusCircle}
            onPress={() => {
              setSearchUserIds(providerUserIds);
              setIsOpen(true);
            }}
            iconColor={styles.plusIcon?.color}
            testID={tID('add-provider-button')}
          />
          {selectedProviders?.map((userProfile) => (
            <Chip
              key={userProfile.id}
              style={styles.chipView}
              testID={tID('chip')}
              textStyle={styles.chipText}
            >
              {userProfile.profile.displayName}
            </Chip>
          ))}
        </View>
        {isProvider && (
          <>
            <Divider style={styles.dividerView} />
            <View style={styles.descriptionView}>
              <Text style={styles.toProvidersLabel}>
                {t('patient-list-label', {
                  defaultValue: 'Select Patient',
                })}
              </Text>
            </View>
            <View style={styles.toUsersView}>
              <IconButton
                icon={PlusCircle}
                testID={tID('add-patient-button')}
                disabled={
                  selectedPatients.length > 0 &&
                  searchUserIds === patientUserIds
                }
                onPress={() => {
                  setSearchUserIds(patientUserIds);
                  setIsOpen(true);
                }}
                iconColor={styles.plusIcon?.color}
              />
              {selectedPatients?.map((userProfile) => (
                <Chip
                  key={userProfile.id}
                  style={styles.chipView}
                  testID={tID('chip')}
                  textStyle={styles.chipText}
                >
                  {userProfile.profile.displayName}
                </Chip>
              ))}
            </View>
          </>
        )}
        <Divider style={styles.dividerView} />
        <Text style={styles.writeMessageLabel}>
          {t('compose-message-label', {
            defaultValue: 'Write Your Message',
          })}
        </Text>
        <ComposeInputBar users={selectedProfiles} routeMapIn={routeMapIn} />
      </View>
    </Provider>
  );
}

export const createComposeMessageScreen = <ParamList extends ParamListBase>(
  routeMap: ComposeScreenParamTypes<ParamList>['RouteMap'],
) => {
  return (props: ComposeScreenParamTypes<ParamList>['ScreenProps']) => (
    <ComposeMessageScreen {...props} routeMapIn={routeMap} />
  );
};

const defaultStyles = createStyles('ComposeMessageScreen', (theme) => ({
  rootContainer: { flex: 1 },
  descriptionView: {
    marginLeft: theme.spacing.medium,
  },
  toUsersView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    margin: theme.spacing.medium,
    backgroundColor: theme.colors.elevation.level3,
  },
  chipView: {
    marginRight: theme.spacing.tiny,
    marginBottom: theme.spacing.tiny,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.surface,
  },
  dividerView: { marginBottom: theme.spacing.medium },
  toPatientsLabel: {
    fontWeight: '700',
  },
  toProvidersLabel: {
    fontWeight: '700',
  },
  writeMessageLabel: {
    fontWeight: '700',
    marginLeft: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  plusIcon: {
    color: theme.colors.secondary,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

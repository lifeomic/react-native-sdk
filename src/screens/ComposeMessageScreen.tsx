import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Chip,
  Text,
  Divider,
  IconButton,
  Modal,
  Provider,
  Portal,
} from 'react-native-paper';
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { t } from 'i18next';
import { createStyles, useIcons } from '../components';
import { ComposeInputBar } from '../components/Messaging/ComposeInputBar';
import { useStyles } from '../components/BrandConfigProvider/styles/StylesProvider';
import { tID } from '../components/TrackTile/common/testID';
import { ScreenParamTypes as BaseScreenParamTypes } from './utils/stack-helpers';
import { DirectMessageParams } from './DirectMessagesScreen';
import { ParamListBase } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAppConfig } from '../hooks/useAppConfig';
import { UserProfile } from '../hooks/useMessagingProfiles';
import { SearchRecipientsModal } from '../components/Messaging/SearchRecipientsModal';
import { useUser } from '../hooks/useUser';
import { useLogoHeaderDimensions } from '../hooks/useLogoHeaderDimensions';

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
  const { PlusCircle, X: XIcon } = useIcons();
  const [searchUserIds, setSearchUserIds] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<UserProfile[]>([]);
  const { data: appConfig } = useAppConfig();
  const { data: userData } = useUser();
  const scrollRef = useRef<ScrollView>(null);
  const appBarHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const [{ height: logoHeaderHeight }] = useLogoHeaderDimensions();
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

  const openModal = useCallback((userIds: string[]) => {
    setSearchUserIds(userIds);
    setIsOpen(true);
  }, []);

  const openPatientModal = useCallback(
    () => openModal(patientUserIds),
    [openModal, patientUserIds],
  );
  const openProviderModal = useCallback(
    () => openModal(providerUserIds),
    [openModal, providerUserIds],
  );

  return (
    <Provider>
      <Portal>
        <Modal visible={isOpen} onDismiss={() => setIsOpen(false)}>
          <SearchRecipientsModal
            userIds={searchUserIds}
            onProfileSelected={addSelectedProfile}
            selectedProfiles={selectedProfiles}
            hideSelf={() => setIsOpen(false)}
          />
        </Modal>
      </Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.rootContainer}
        keyboardVerticalOffset={
          appBarHeight +
          (logoHeaderHeight || (StatusBar.currentHeight ?? 0)) + // LogoHeader accounts for statusBar height. If it is not set, we should factor in the statusBar height.
          Platform.select({ android: tabBarHeight, default: 0 }) // Android changes the height of the app when the keyboard is open so tabs are always visible.
        }
      >
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={() => {
            scrollRef.current?.scrollToEnd({ animated: true });
          }}
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.contentContainer}>
              <Divider style={styles.dividerView} />
              <View style={styles.descriptionView}>
                <Text style={styles.toProvidersLabel}>
                  {t('provider-list-label', {
                    defaultValue: 'Select Providers',
                  })}
                </Text>
              </View>
              <TouchableWithoutFeedback onPress={openProviderModal}>
                <View style={styles.toUsersView}>
                  <IconButton
                    icon={PlusCircle}
                    onPress={openProviderModal}
                    size={12}
                    iconColor={styles.plusIcon?.color}
                    testID={tID('add-provider-button')}
                  />
                  {selectedProviders?.map((userProfile) => (
                    <Chip
                      key={userProfile.id}
                      style={styles.chipView}
                      testID={tID('chip')}
                      textStyle={styles.chipText}
                      onPress={() =>
                        setSelectedProfiles((current) =>
                          current.filter((c) => c.id !== userProfile.id),
                        )
                      }
                    >
                      {userProfile.profile.displayName}
                      <View style={styles.removeChipContainer}>
                        <XIcon {...styles.removeChipIcon} />
                      </View>
                    </Chip>
                  ))}
                </View>
              </TouchableWithoutFeedback>
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
                  <TouchableWithoutFeedback onPress={openPatientModal}>
                    <View style={styles.toUsersView}>
                      <IconButton
                        icon={PlusCircle}
                        testID={tID('add-patient-button')}
                        disabled={selectedPatients.length > 0}
                        onPress={openPatientModal}
                        size={12}
                        iconColor={styles.plusIcon?.color}
                      />
                      {selectedPatients?.map((userProfile) => (
                        <Chip
                          key={userProfile.id}
                          style={styles.chipView}
                          testID={tID('chip')}
                          textStyle={styles.chipText}
                          onPress={() =>
                            setSelectedProfiles((current) =>
                              current.filter((c) => c.id !== userProfile.id),
                            )
                          }
                        >
                          {userProfile.profile.displayName}
                          <View style={styles.removeChipContainer}>
                            <XIcon {...styles.removeChipIcon} />
                          </View>
                        </Chip>
                      ))}
                    </View>
                  </TouchableWithoutFeedback>
                </>
              )}
              <Divider style={styles.dividerView} />
              <Text style={styles.writeMessageLabel}>
                {t('compose-message-label', {
                  defaultValue: 'Write Your Message',
                })}
              </Text>
              <ComposeInputBar
                users={selectedProfiles}
                routeMapIn={routeMapIn}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContainer: { flex: 1 },
  scrollContentContainer: { flexGrow: 1 },
  contentContainer: { flex: 1 },
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
    marginLeft: theme.spacing.tiny,
    marginVertical: 2,
    backgroundColor: theme.colors.primary,
    maxHeight: 30,
  },
  chipText: {
    color: theme.colors.surface,
  },
  removeChipContainer: {
    color: theme.colors.surface,
    justifyContent: 'center',
    paddingLeft: 6,
    marginTop: -2,
    marginRight: -4,
    height: '100%',
  },
  removeChipIcon: {
    color: theme.colors.surface,
    width: 12,
    height: 12,
  },
  dividerView: { marginBottom: theme.spacing.medium },
  toPatientsLabel: {
    fontWeight: '700',
  },
  toProvidersLabel: {
    fontWeight: '700',
    color: theme.colors.onBackground,
  },
  writeMessageLabel: {
    fontWeight: '700',
    marginLeft: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    color: theme.colors.onBackground,
  },
  plusIcon: {
    color: theme.colors.secondary,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

import i18n from 'format-message';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  NativeModules,
  Linking,
  Text,
  LayoutAnimation,
  SafeAreaView,
  View,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  SyncTypeSettings,
  ToggleWearableResult,
} from '@lifeomic/wearables-sync';
import { useOnAppStateChange } from '@lifeomic/life-extend/dist/src/common/hooks/useOnAppStateChange';
import { WearablesView } from '../components/Wearables';
// import { ThemedView } from '../common/components/ThemedView';
// import Colors from '../common/colors';
// import { headerStyles } from '../common/components/Header';
// import { Padding } from '../common/constants';
import { tID } from '../common/testID';
import { EHRType } from '../components/Wearables/WearableTypes';
// import colors from '../common/colors';
import { SettingsStackParamList } from '../navigators/SettingsStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import StatusBar from '../common/components/StatusBar';
import { useAppConfig } from '../hooks/useAppConfig';
// import ThemedBackground from '../common/components/ThemedBackground';

export const openURL = (url: string) => {
  Linking.openURL(url);
};

type Props = NativeStackScreenProps<SettingsStackParamList, 'Wearables'>;

const WearablesScreen = ({ route }: Props) => {
  const {
    appId,
    data,
    error,
    loading: wearablesLoading,
    refetch,
    syncConfig,
  } = useWearablesSync();
  // const { brand } = useAppConfig();
  const headerHeight = useHeaderHeight();
  const [loading, setLoading] = useState(true);
  // const headerShown =
  //   brand.components.WearablesScreen?.options?.headerShown ??
  //   brand.components.StackScreen?.defaultProps?.options?.headerShown;
  // const Container = headerShown ? View : SafeAreaView;

  const allWearables = data?.items || [];
  const wearableId = route.params?.ehrType;
  const wearables = wearableId
    ? allWearables.filter((w) => w.ehrType === wearableId)
    : allWearables;

  useEffect(() => {
    LayoutAnimation.easeInEaseOut();
    setLoading(wearablesLoading);
  }, [wearablesLoading]);

  // Refetch data each time we navigate to this view
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleWearable = useCallback(
    async (ehrId: string, value: boolean) => {
      if (!syncConfig) return {} as ToggleWearableResult;
      const result = await syncConfig.toggleWearableIntegration(ehrId, value, {
        appId,
      });

      const wearable = wearables.find((w) => w.ehrId === ehrId);
      Analytics.track(value ? Events.sync.toggledOn : Events.sync.toggledOff, {
        syncType: wearable?.ehrType,
      });

      // If healthKit was just turned OFF, turn off background syncing
      if (
        wearable?.ehrType === EHRType.HealthKit &&
        (await NativeModules.LXWearablesSync.isHealthKitAllowed()) &&
        (await NativeModules.LXWearablesSync.isObservingHealthKit())
      ) {
        await NativeModules.LXWearablesSync.stopObservingHealthKit();
        console.log(
          'HealthKit background sync turned off when user toggled off',
        );
      }

      return result;
    },
    [syncConfig, appId, wearables],
  );

  const updateSyncTypeSettings = async (settings: SyncTypeSettings) => {
    if (!syncConfig) return;
    setLoading(true);
    await syncConfig.setSyncTypes(settings);
    refetch();
  };

  const handleError = (error: Error) => {
    presentLOError(new LOError(error));
    setLoading(false);
  };

  // When toggling oauth-based wearable, need to refresh when
  // coming back into the app:
  useOnAppStateChange(refetch);

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Text style={headerStyles.headerText}>
          {i18n('Error fetching Sync Data options')}
        </Text>
        <Text style={styles.fetchError} testID={tID('error-message')}>
          {i18n(
            'There was a problem fetching Sync Data options. Make sure you have internet access and try again.',
          )}
        </Text>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, brand.styles.wearablesViewWrapper]}>
      <StatusBar />
      <ThemedBackground>
        <Container
          style={[
            styles.container,
            // eslint-disable-next-line react-native/no-inline-styles
            { marginTop: headerShown ? 0 : headerHeight },
          ]}
        >
          <WearablesView
            styles={brand.styles.wearablesView}
            enableMultiWearable={true}
            loading={loading}
            nativeWearablesSync={NativeModules.LXWearablesSync}
            onError={handleError}
            onRefreshNeeded={refetch}
            onShowLearnMore={openURL}
            onShowWearableAuth={openURL}
            onSyncTypeSelectionsUpdate={updateSyncTypeSettings}
            onToggleWearable={toggleWearable}
            wearables={wearables}
            switchProps={{
              trackColor: {
                true: colors.palette.blue,
              },
              thumbColor: colors.white,
            }}
            // NOTE: this controls the _initial_ HealthKit permission asks, so
            // it's fine to not have this list filtered by user-selections yet.
            nativeSyncTypesToRequest={appNativeSyncTypes}
          />
        </Container>
      </ThemedBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  errorContainer: {
    flex: 1,
    padding: Padding.standard,
  },
  fetchError: {
    color: Colors.text.veryLight,
    marginTop: Padding.standard,
  },
});

export default WearablesScreen;

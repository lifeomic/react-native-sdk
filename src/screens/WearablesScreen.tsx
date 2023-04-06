import React, { useCallback } from 'react';
import { StyleSheet, Linking, View } from 'react-native';
import { WearablesView } from '../components/Wearables';
import { useWearables } from '../hooks/useWearables';
import { getBundleId } from 'react-native-device-info';
import { SyncTypeSettings } from '../components/Wearables/WearableTypes';

export const openURL = (url: string) => {
  Linking.openURL(url);
};

const WearablesScreen = () => {
  const appId = getBundleId().toLowerCase();
  const { setWearableState, setSyncTypes, useQueryWearableIntegrations } =
    useWearables();
  const { data, refetch, isLoading } = useQueryWearableIntegrations(appId);

  const wearables = data?.items || [];

  const toggleWearable = useCallback(
    async (ehrId: string, enabled: boolean) => {
      return setWearableState({
        ehrId,
        enabled,
        meta: {
          appId,
        },
      });
    },
    [appId, setWearableState],
  );

  const updateSyncTypeSettings = async (settings: SyncTypeSettings) => {
    await setSyncTypes(settings);
    refetch();
  };
  return (
    <View style={[styles.container]}>
      <WearablesView
        enableMultiWearable={true}
        loading={isLoading}
        onRefreshNeeded={refetch}
        onShowLearnMore={openURL}
        onShowWearableAuth={openURL}
        onSyncTypeSelectionsUpdate={updateSyncTypeSettings}
        onToggleWearable={toggleWearable}
        wearables={wearables}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
});

export default WearablesScreen;

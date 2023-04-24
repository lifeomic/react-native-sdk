import React, { useCallback } from 'react';
import { StyleSheet, Linking, View } from 'react-native';
import { WearablesView } from '../components/Wearables';
import { useWearables } from '../hooks/useWearables';
import { SyncTypeSettings } from '../components/Wearables/WearableTypes';
import { getBundleId } from 'react-native-device-info';
import { useWearableLifecycleHooks } from '../components/Wearables/WearableLifecycleProvider';

export const openURL = (url: string) => {
  Linking.openURL(url);
};

const WearablesScreen = () => {
  const { setWearableState, setSyncTypes, useWearableIntegrationsQuery } =
    useWearables();
  const { data, refetch, isLoading } = useWearableIntegrationsQuery();
  const { onPostToggle } = useWearableLifecycleHooks();

  const wearables = data?.items || [];

  const toggleWearable = useCallback(
    async (ehrId: string, enabled: boolean) => {
      const result = await setWearableState({
        ehrId,
        enabled,
        meta: {
          appId: getBundleId().toLocaleLowerCase(),
        },
      });

      await onPostToggle(result);

      return result;
    },
    [setWearableState, onPostToggle],
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

import React, { useCallback } from 'react';
import { StyleSheet, Linking, View } from 'react-native';
import { WearablesView } from '../components/Wearables';
import { useWearables } from '../hooks/useWearables';
import {
  SyncTypeSettings,
  WearableIntegration,
} from '../components/Wearables/WearableTypes';
import { getBundleId } from 'react-native-device-info';
import { useWearableLifecycleHooks } from '../components/Wearables/WearableLifecycleProvider';
import { useWearableBackfill } from '../hooks/useWearableBackfill';

export const openURL = (url: string) => {
  Linking.openURL(url);
};

const WearablesScreen = () => {
  const { setWearableState, setSyncTypes, useWearableIntegrationsQuery } =
    useWearables();
  const { data, refetch, isLoading } = useWearableIntegrationsQuery();
  const { onPostToggle, onBackfill } = useWearableLifecycleHooks();
  const { enabledBackfillWearables, backfillEHR } = useWearableBackfill(data);

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

  const handleBackfill = useCallback(
    async (integration: WearableIntegration) => {
      const res = await Promise.all([
        backfillEHR(integration.ehrId),
        onBackfill(integration),
      ]);

      return res.some((didBackfill) => didBackfill);
    },
    [onBackfill, backfillEHR],
  );

  return (
    <View style={[styles.container]}>
      <WearablesView
        loading={isLoading}
        onRefreshNeeded={refetch}
        onShowLearnMore={openURL}
        onShowWearableAuth={openURL}
        onSyncTypeSelectionsUpdate={updateSyncTypeSettings}
        onToggleWearable={toggleWearable}
        onBackfillWearable={handleBackfill}
        wearables={wearables}
        enabledBackfillWearables={enabledBackfillWearables}
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

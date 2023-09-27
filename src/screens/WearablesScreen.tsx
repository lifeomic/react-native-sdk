import React, { useCallback, useMemo } from 'react';
import { Linking, Platform, View } from 'react-native';
import { WearablesView } from '../components/Wearables';
import { useWearables } from '../hooks/useWearables';
import {
  EHRType,
  SyncTypeSettings,
  WearableIntegration,
} from '../components/Wearables/WearableTypes';
import { getBundleId } from 'react-native-device-info';
import { useWearableLifecycleHooks } from '../components/Wearables/WearableLifecycleProvider';
import { useWearableBackfill } from '../hooks/useWearableBackfill';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks';

export const openURL = (url: string) => {
  Linking.openURL(url);
};

const WearablesScreen = () => {
  const { styles } = useStyles(defaultStyles);
  const { setWearableState, setSyncTypes, useWearableIntegrationsQuery } =
    useWearables();
  const { data, refetch, isLoading } = useWearableIntegrationsQuery();
  const { onPostToggle, onBackfill } = useWearableLifecycleHooks();
  const { enabledBackfillWearables, backfillEHR } = useWearableBackfill(data);

  const wearables = useMemo(() => {
    let items = data?.items || [];
    if (Platform.OS !== 'ios') {
      items = items.filter((w) => w.ehrType !== EHRType.HealthKit);
    }
    return items;
  }, [data?.items]);

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

const defaultStyles = createStyles('TrackTileSettingsScreen', () => ({
  container: {
    flex: 1,
    padding: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default WearablesScreen;

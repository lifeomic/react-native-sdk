import { WearableStateSyncType } from './WearableTypes';
import {
  SyncTypeSettings,
  WearableIntegration,
  WearableIntegrationStatus,
} from './WearableTypes';
import React, { FC, useCallback } from 'react';

import {
  SyncTypeSelectionRow,
  SyncTypeSelectionRowStyles,
} from './SyncTypeSelectionRow';
import { t } from 'i18next';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface SyncTypeSelectionViewProps {
  disabled?: boolean;
  onUpdate: (settings: Record<WearableStateSyncType, string>) => any;
  styles?: any;
  testID?: string;
  wearables: WearableIntegration[];
}

export const SyncTypeSelectionView: FC<SyncTypeSelectionViewProps> = (
  props,
) => {
  const { disabled, onUpdate, wearables, styles: instanceStyles } = props;
  const { styles } = useStyles(defaultStyles, instanceStyles);

  const settings = getSyncTypesFromWearables(wearables);
  const syncTypeOptions = getSyncTypeOptions(wearables);
  const sortedKeys = Object.keys(settings).sort((syncTypeA, syncTypeB) => {
    return getDisplayValueForSyncType(syncTypeA).localeCompare(
      getDisplayValueForSyncType(syncTypeB),
    );
  });

  const _onUpdate = useCallback(
    (syncType: WearableStateSyncType) => (ehrId: string) => {
      const effectiveEHRId = ehrId === 'none' ? undefined : ehrId;
      const currentEHRId = settings[syncType];
      if (effectiveEHRId === currentEHRId) {
        console.info(
          'User reaffirmed the existing selection, no need to update',
          syncType,
          ehrId,
        );
        return;
      }

      if (!effectiveEHRId) {
        delete settings[syncType];
      } else {
        settings[syncType] = effectiveEHRId;
      }
      onUpdate(settings);
    },
    [onUpdate, settings],
  );

  return (
    <>
      {sortedKeys.map((sortedSyncType) => {
        const typedSyncType = sortedSyncType as WearableStateSyncType;
        const selectedEHRId = settings[typedSyncType];
        return (
          <SyncTypeSelectionRow
            disabled={disabled}
            key={sortedSyncType}
            onUpdate={_onUpdate(typedSyncType)}
            selectedEHRId={selectedEHRId}
            styles={styles.syncTypeSelectionRow as SyncTypeSelectionRowStyles}
            syncTypeTitle={getDisplayValueForSyncType(typedSyncType)}
            syncTypeOptions={syncTypeOptions[typedSyncType]}
          />
        );
      })}
    </>
  );
};

const defaultStyles = createStyles('SyncTypeSelectionView', () => ({
  syncTypeSelectionRow: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type SyncTypeSelectionViewStyles = NamedStylesProp<typeof defaultStyles>;

export const getSyncTypesFromWearables = (wearables: WearableIntegration[]) => {
  const settings = {} as SyncTypeSettings;
  const allSupportedSyncTypes = new Set<WearableStateSyncType>();
  for (const wearable of wearables) {
    if (shouldShowWearable(wearable)) {
      for (const syncType of wearable.syncTypes || []) {
        settings[syncType] = wearable.ehrId;
      }
      for (const syncType of wearable.supportedSyncTypes || []) {
        allSupportedSyncTypes.add(syncType);
      }
    }
  }

  // Populate any 'none' sync type selections
  for (const syncType of allSupportedSyncTypes.values()) {
    if (!settings[syncType]) {
      settings[syncType] = 'none';
    }
  }

  // Remove any unsupported syncTypes
  const filteredSettings = { ...settings } as SyncTypeSettings;
  for (const [syncType, ehrId] of Object.entries(settings)) {
    const wearable = wearables.find((w) => w.ehrId === ehrId);
    if (
      wearable &&
      !wearable.supportedSyncTypes?.includes(syncType as WearableStateSyncType)
    ) {
      delete filteredSettings[syncType as WearableStateSyncType];
    }
  }

  return filteredSettings;
};

export const getSyncTypeOptions = (wearables: WearableIntegration[]) => {
  const options = {} as Record<string, WearableIntegration[]>;
  for (const wearable of wearables) {
    if (shouldShowWearable(wearable)) {
      for (const syncType of wearable.supportedSyncTypes || []) {
        options[syncType] = options[syncType] || [];
        options[syncType].push(wearable);
      }
    }
  }

  // Add a "Do not sync" option for all syncTypes
  for (const syncType in options) {
    options[syncType].push({
      ehrId: 'none',
      ehrType: 'none',
      name: t('do-not-sync-wearable-metrics', 'Do not sync'),
      enabled: false,
    });
  }

  return options;
};

export const getDisplayValueForSyncType = (
  syncType: WearableStateSyncType | string,
) => {
  switch (syncType) {
    case WearableStateSyncType.BloodGlucose:
      return t('glucose', 'Glucose');
    case WearableStateSyncType.BloodKetones:
      return t('ketones', 'Ketones');
    case WearableStateSyncType.BloodPressure:
      return t('blood-pressure', 'Blood Pressure');
    case WearableStateSyncType.BodyMass:
      return t('weight', 'Weight');
    case WearableStateSyncType.BodyMassIndex:
      return t('body-mass-infex', 'BMI');
    case WearableStateSyncType.BreathKetones:
      return t('breath-ketones', 'Breath Ketones');
    case WearableStateSyncType.Immunization:
      return t('immunizations', 'Immunizations');
    case WearableStateSyncType.MindfulSession:
      return t('mindfulness', 'Mindfulness');
    case WearableStateSyncType.RespiratoryRate:
      return t('respiratory-rate', 'Respiratory Rate');
    case WearableStateSyncType.RestingHeartRate:
      return t('resting-heart-rate', 'Resting Heart Rate');
    case WearableStateSyncType.SleepAnalysis:
      return t('sleep', 'Sleep');
    case WearableStateSyncType.StepCount:
      return t('step-count', 'Step Count');
    case WearableStateSyncType.Vo2Max:
      return t('vo2-max', 'VO₂ Max');
    case WearableStateSyncType.Workout:
      return t('activity', 'Activity');
    default:
      return syncType;
  }
};

export const shouldShowWearable = (wearable: WearableIntegration) => {
  return (
    wearable.enabled ||
    wearable.status === WearableIntegrationStatus.NeedsAuthorization
  );
};

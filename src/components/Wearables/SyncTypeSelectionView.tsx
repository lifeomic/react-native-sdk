import { WearableStateSyncType } from './WearableTypes';
import {
  SyncTypeSettings,
  WearableIntegration,
  WearableIntegrationStatus,
} from './WearableTypes';
import i18n from 'format-message';
import React, { FC, useCallback } from 'react';

import { SyncTypeSelectionRow } from './SyncTypeSelectionRow';

export interface SyncTypeSelectionViewProps {
  disabled?: boolean;
  onUpdate: (settings: Record<WearableStateSyncType, string>) => any;
  selectionRowStyles?: any;
  testID?: string;
  wearables: WearableIntegration[];
}

export const SyncTypeSelectionView: FC<SyncTypeSelectionViewProps> = (
  props,
) => {
  const { disabled, onUpdate, selectionRowStyles, wearables } = props;

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
            styles={selectionRowStyles}
            syncTypeTitle={getDisplayValueForSyncType(typedSyncType)}
            syncTypeOptions={syncTypeOptions[typedSyncType]}
          />
        );
      })}
    </>
  );
};

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
      name: i18n('Do not sync'),
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
      return i18n('Glucose');
    case WearableStateSyncType.BloodKetones:
      return i18n('Ketones');
    case WearableStateSyncType.BloodPressure:
      return i18n('Blood Pressure');
    case WearableStateSyncType.BodyMass:
      return i18n('Weight');
    case WearableStateSyncType.BreathKetones:
      return i18n('Breath Ketones');
    case WearableStateSyncType.Immunization:
      return i18n('Immunizations');
    case WearableStateSyncType.MindfulSession:
      return i18n('Mindfulness');
    case WearableStateSyncType.RespiratoryRate:
      return i18n('Respiratory Rate');
    case WearableStateSyncType.RestingHeartRate:
      return i18n('Resting Heart Rate');
    case WearableStateSyncType.SleepAnalysis:
      return i18n('Sleep');
    case WearableStateSyncType.StepCount:
      return i18n('Step Count');
    case WearableStateSyncType.Vo2Max:
      return i18n('VO₂ Max');
    case WearableStateSyncType.Workout:
      return i18n('Activity');
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

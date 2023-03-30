import React, { FC, useState } from 'react';
import { Platform } from 'react-native';
import merge from 'lodash/merge';
import { storiesOf } from '@storybook/react-native';
import {
  WearablesView,
  WearablesViewDefaultStyles,
  WearablesViewProps,
} from '../../../../src/components/Wearables//WearablesView';
import {
  SyncTypeSettings,
  WearableIntegration,
  WearableIntegrationStatus,
} from '@lifeomic/wearables-sync';
import { rowActions } from './WearableRow.stories';
import { EHRType, WearableStateSyncType } from '@lifeomic/ehr-core';
import { action } from '@storybook/addon-actions';
import { boolean, object, withKnobs } from '@storybook/addon-knobs';
import { WearableRowDefaultStyles } from '../../../../src/components/Wearables//WearableRow';
import { SyncTypeSelectionRowDefaultStyles } from '../../../../src/components/Wearables//SyncTypeSelectionRow';
import { SwitchRowDefaultStyles } from '../../../../src/components/Wearables//SwitchRow';
import { SelectorViewDefaultStyles } from '../../../../src/components/Wearables//SelectorView';
import { SelectorRowDefaultStyles } from '../../../../src/components/Wearables//SelectorRow';

export const viewActions = {
  ...rowActions,
  onSyncTypeSelectionsUpdate: action('onSyncTypeSelectionsUpdate'),
};

storiesOf('Wearables View', module)
  .addDecorator(withKnobs)
  .add('default', () => <DefaultView loading={false} />)
  .add('loading (initially)', () => <WearablesView {...loadingProps} />)
  .add('loading (after wearables change)', () => <DefaultView loading={true} />)
  .add('enable sync types', () => (
    <DefaultView loading={false} enableMultiWearable={true} />
  ))
  .add('loading with enable sync types', () => (
    <DefaultView loading={true} enableMultiWearable={true} />
  ));

const mockWearables: WearableIntegration[] = [
  {
    // NOTE: Should only show on iOS simulator
    ehrId: EHRType.HealthKit,
    ehrType: EHRType.HealthKit,
    name: 'Apple Health',
    enabled: false,
    supportedSyncTypes: [
      WearableStateSyncType.BodyMass,
      WearableStateSyncType.MindfulSession,
      WearableStateSyncType.SleepAnalysis,
      WearableStateSyncType.Workout,
    ],
    syncTypes: [WearableStateSyncType.MindfulSession],
  },
  {
    // NOTE: Should only show on Samsung emulator
    ehrId: EHRType.SamsungHealth,
    ehrType: EHRType.SamsungHealth,
    name: 'Samsung Health',
    enabled: false,
  },
  {
    ehrId: EHRType.Garmin,
    ehrType: EHRType.Garmin,
    name: 'Garmin',
    enabled: true,
    status: WearableIntegrationStatus.Syncing,
    supportedSyncTypes: [
      WearableStateSyncType.BodyMass,
      WearableStateSyncType.SleepAnalysis,
      WearableStateSyncType.Workout,
    ],
    syncTypes: [WearableStateSyncType.BodyMass],
  },
  {
    ehrId: EHRType.Fitbit,
    ehrType: EHRType.Fitbit,
    name: 'Fitbit',
    enabled: true,
    status: WearableIntegrationStatus.Syncing,
    supportedSyncTypes: [
      WearableStateSyncType.BodyMass,
      WearableStateSyncType.SleepAnalysis,
      WearableStateSyncType.Workout,
    ],
    syncTypes: [
      WearableStateSyncType.Workout,
      WearableStateSyncType.SleepAnalysis,
    ],
  },
  {
    ehrId: EHRType.KetoMojo,
    ehrType: EHRType.KetoMojo,
    name: 'Keto-Mojo',
    enabled: false,
    supportedSyncTypes: [
      WearableStateSyncType.BloodGlucose,
      WearableStateSyncType.BloodKetones,
    ],
  },
  {
    ehrId: EHRType.Dexcom,
    ehrType: EHRType.Dexcom,
    name: 'Dexcom',
    enabled: false,
    supportedSyncTypes: [WearableStateSyncType.BloodGlucose],
  },
  {
    ehrId: EHRType.GoogleFit,
    ehrType: EHRType.GoogleFit,
    name: 'Google Fit',
    enabled: false,
    supportedSyncTypes: [
      WearableStateSyncType.BloodGlucose,
      WearableStateSyncType.BodyMass,
      WearableStateSyncType.SleepAnalysis,
      WearableStateSyncType.Workout,
    ],
  },
  {
    ehrId: EHRType.ReadoutHealth,
    ehrType: EHRType.ReadoutHealth,
    name: 'Biosense',
    enabled: false,
    supportedSyncTypes: [WearableStateSyncType.BreathKetones],
  },
  {
    ehrId: EHRType.Oura,
    ehrType: EHRType.Oura,
    name: 'Oura',
    enabled: false,
    supportedSyncTypes: [
      WearableStateSyncType.MindfulSession,
      WearableStateSyncType.SleepAnalysis,
      WearableStateSyncType.Workout,
    ],
  },
];

interface DefaultViewProps {
  enableMultiWearable?: boolean;
  loading: boolean;
}

const DefaultView: FC<DefaultViewProps> = ({
  enableMultiWearable,
  loading: initialLoading,
}) => {
  const [loading, setLoading] = useState(initialLoading);
  const [wearables, setWearables] = useState(mockWearables);

  const onRefreshNeeded = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const onToggleWearable = async (ehrId: string, enabled: boolean) => {
    const result = await rowActions.onToggleWearable(ehrId, enabled);

    // Faking/mocking these changing for a good story experience.
    const wearable = wearables.find((w) => w.ehrId === ehrId)!;
    wearable.enabled = enabled;
    wearable.status = enabled ? WearableIntegrationStatus.Syncing : undefined;

    setWearables(wearables);

    return result;
  };

  const onSyncTypeSelectionsUpdate = async (settings: SyncTypeSettings) => {
    action('onSyncTypeSelectionsUpdate')(settings);

    // Clear syncTypes, then set selections
    for (const wearable of wearables) {
      wearable.syncTypes = [];
    }
    for (const [syncType, ehrId] of Object.entries(settings)) {
      const wearable = wearables.find((w) => w.ehrId === ehrId);
      wearable?.syncTypes?.push(syncType as WearableStateSyncType);
    }

    setWearables(wearables);
    onRefreshNeeded();
  };

  const nativeWearablesSync = Platform.select({
    ios: {
      isHealthKitAllowed: () => Promise.resolve(true),
      isSamsungHealthAllowed: () => Promise.resolve(false),
      authorizeHealthKit: () => Promise.resolve(),
      requestPermissions: () => Promise.resolve(),
    },
    android: {
      isHealthKitAllowed: () => Promise.resolve(false),
      isSamsungHealthAllowed: () => Promise.resolve(true),
      authorizeHealthKit: () => Promise.resolve(),
      requestPermissions: () => Promise.resolve(),
    },
  });

  return (
    <WearablesView
      {...viewActions}
      enableMultiWearable={boolean(
        'enableMultiWearable',
        !!enableMultiWearable,
      )}
      loading={boolean('loading', loading)}
      nativeWearablesSync={nativeWearablesSync}
      onRefreshNeeded={onRefreshNeeded}
      onSyncTypeSelectionsUpdate={onSyncTypeSelectionsUpdate}
      onToggleWearable={onToggleWearable}
      styles={object(
        'styles',
        merge(
          {},
          {
            ...WearablesViewDefaultStyles,
            wearableRow: {
              ...WearableRowDefaultStyles,
              switchRow: SwitchRowDefaultStyles,
            },
            selectionRowStyles: {
              ...SyncTypeSelectionRowDefaultStyles,
              selectorView: {
                ...SelectorViewDefaultStyles,
                selectorRow: SelectorRowDefaultStyles,
              },
            },
          },
          storyStyles,
        ),
      )}
      wearables={wearables}
    />
  );
};

const loadingProps: WearablesViewProps = {
  loading: true,
  wearables: [],
  ...viewActions,
};

const storyStyles = {
  container: {
    flex: 1,
    width: Platform.select({
      web: '500px',
      default: '100%',
    }),
    margin: 'auto',
  },
};

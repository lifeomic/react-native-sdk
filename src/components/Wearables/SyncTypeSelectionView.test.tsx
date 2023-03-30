import React from 'react';
import {
  getSyncTypesFromWearables,
  SyncTypeSelectionView,
  SyncTypeSelectionViewProps
} from '../src/SyncTypeSelectionView';
import {
  WearableIntegration,
  WearableIntegrationStatus
} from '@lifeomic/wearables-sync';
import { WearableStateSyncType } from '@lifeomic/ehr-core';
import { fireEvent, render } from '@testing-library/react-native';

const onUpdate = jest.fn();
const baseProps: SyncTypeSelectionViewProps = {
  onUpdate,
  testID: 'unit-test',
  wearables: [
    {
      ehrId: 'ehr1',
      ehrType: 'ehr1',
      name: 'Wearable 1',
      enabled: true,
      supportedSyncTypes: [
        WearableStateSyncType.BodyMass,
        WearableStateSyncType.SleepAnalysis,
        WearableStateSyncType.Workout
      ],
      syncTypes: [WearableStateSyncType.SleepAnalysis]
    },
    {
      ehrId: 'ehr2',
      ehrType: 'ehr2',
      name: 'Wearable 2',
      enabled: true,
      supportedSyncTypes: [
        WearableStateSyncType.BodyMass,
        WearableStateSyncType.Workout
      ],
      syncTypes: [WearableStateSyncType.BodyMass]
    },
    {
      ehrId: 'ehr3',
      ehrType: 'ehr3',
      name: 'Wearable 3',
      enabled: true,
      supportedSyncTypes: [WearableStateSyncType.Workout],
      syncTypes: []
    },
    {
      ehrId: 'ehr4',
      ehrType: 'ehr4',
      name: 'Wearable 4',
      enabled: false,
      supportedSyncTypes: [WearableStateSyncType.MindfulSession]
    }
  ]
};

describe('SyncTypeSelectionRow', () => {
  it('renders syncTypes and currently selected wearables', () => {
    const { getByText } = render(<SyncTypeSelectionView {...baseProps} />);
    expect(getByText('Sleep')).toBeDefined();
    expect(getByText('Wearable 1')).toBeDefined();

    expect(getByText('Weight')).toBeDefined();
    expect(getByText('Wearable 2')).toBeDefined();

    expect(getByText('Activity')).toBeDefined();
    expect(getByText('Do not sync')).toBeDefined();
  });

  it('renders ally labels and currently selected wearables', () => {
    const { getByA11yLabel } = render(<SyncTypeSelectionView {...baseProps} />);
    expect(getByA11yLabel('Sleep')).toBeDefined();
    expect(getByA11yLabel('Wearable 1 - Sleep')).toBeDefined();

    expect(getByA11yLabel('Weight')).toBeDefined();
    expect(getByA11yLabel('Wearable 2 - Weight')).toBeDefined();

    expect(getByA11yLabel('Activity')).toBeDefined();
    expect(getByA11yLabel('Do not sync - Activity')).toBeDefined();
  });

  it('does not explode if wearables have no syncTypes or supportedSyncTypes', () => {
    expect(() =>
      render(
        <SyncTypeSelectionView
          {...baseProps}
          wearables={[
            {
              ehrId: 'ehr1',
              ehrType: 'ehr1',
              name: 'Wearable 1',
              enabled: true
            },
            {
              ehrId: 'ehr2',
              ehrType: 'ehr2',
              name: 'Wearable 2',
              enabled: true
            }
          ]}
        />
      )
    ).not.toThrow();
  });

  it('allows for selecting new wearable for syncType', () => {
    const { getByText } = render(<SyncTypeSelectionView {...baseProps} />);

    fireEvent.press(getByText('Activity'));

    // NOTE: selections are now visible
    expect(getByText('Wearable 3')).toBeDefined();

    fireEvent.press(getByText('Wearable 3'));

    expect(onUpdate).toHaveBeenCalledWith({
      [WearableStateSyncType.BodyMass]: 'ehr2',
      [WearableStateSyncType.SleepAnalysis]: 'ehr1',
      [WearableStateSyncType.Workout]: 'ehr3'
    });
  });

  it('does not call onUpdate if wearable selection is the same', () => {
    const { getByText } = render(
      <SyncTypeSelectionView
        {...baseProps}
        wearables={[
          {
            ehrId: 'ehr3',
            ehrType: 'ehr3',
            name: 'Wearable 3',
            enabled: true,
            supportedSyncTypes: [WearableStateSyncType.Workout],
            syncTypes: [WearableStateSyncType.Workout]
          }
        ]}
      />
    );

    fireEvent.press(getByText('Activity'));
    expect(getByText('Wearable 3')).toBeDefined();
    fireEvent.press(getByText('Wearable 3'));

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('allows for setting a syncType to NOT sync via any wearable', () => {
    const { getByText } = render(<SyncTypeSelectionView {...baseProps} />);

    fireEvent.press(getByText('Activity'));
    expect(getByText('Do not sync')).toBeDefined();
    fireEvent.press(getByText('Do not sync'));

    expect(onUpdate).toHaveBeenCalledWith({
      [WearableStateSyncType.BodyMass]: 'ehr2',
      [WearableStateSyncType.SleepAnalysis]: 'ehr1'
      // NOTE the missing [WearableStateSyncType.Workout]
    });
  });

  it('has display names for many expected syncTypes, and shows raw syncType others', () => {
    const { getByText } = render(
      <SyncTypeSelectionView
        {...baseProps}
        wearables={[
          {
            ehrId: 'ehr1',
            ehrType: 'ehr1',
            name: 'Wearable 1',
            enabled: true,
            supportedSyncTypes: [
              WearableStateSyncType.BodyMass,
              WearableStateSyncType.BreathKetones,
              WearableStateSyncType.BloodGlucose,
              WearableStateSyncType.BloodKetones,
              WearableStateSyncType.MindfulSession,
              WearableStateSyncType.SleepAnalysis,
              WearableStateSyncType.Workout,
              WearableStateSyncType.Immunization,
              WearableStateSyncType.RespiratoryRate,
              WearableStateSyncType.RestingHeartRate,

              // An unexpected type being used:
              WearableStateSyncType.ActiveEnergyBurned
            ],
            syncTypes: []
          }
        ]}
      />
    );

    expect(getByText('Weight')).toBeDefined();
    expect(getByText('Breath Ketones')).toBeDefined();
    expect(getByText('Glucose')).toBeDefined();
    expect(getByText('Ketones')).toBeDefined();
    expect(getByText('Mindfulness')).toBeDefined();
    expect(getByText('Sleep')).toBeDefined();
    expect(getByText('Activity')).toBeDefined();
    expect(getByText('activeEnergyBurned')).toBeDefined();
    expect(getByText('Immunizations')).toBeDefined();
    expect(getByText('Respiratory Rate')).toBeDefined();
    expect(getByText('Resting Heart Rate')).toBeDefined();
  });
});

describe('getSyncTypesFromWearables', () => {
  it('should return syncType settings given wearables', () => {
    const wearables = ([
      {
        ehrId: 'ehr1',
        enabled: true,
        supportedSyncTypes: [WearableStateSyncType.SleepAnalysis],
        syncTypes: [WearableStateSyncType.SleepAnalysis]
      },
      {
        ehrId: 'ehr2',
        enabled: true,
        supportedSyncTypes: [
          WearableStateSyncType.BodyMass,
          WearableStateSyncType.Workout
        ],
        syncTypes: [
          WearableStateSyncType.BodyMass,
          WearableStateSyncType.Workout
        ]
      }
    ] as any) as WearableIntegration[];

    expect(getSyncTypesFromWearables(wearables)).toEqual({
      [WearableStateSyncType.SleepAnalysis]: 'ehr1',
      [WearableStateSyncType.BodyMass]: 'ehr2',
      [WearableStateSyncType.Workout]: 'ehr2'
    });
  });

  it('should ignore wearables not enabled, but include wearables needing auth', () => {
    const wearables = [
      {
        ehrId: 'ehr1',
        enabled: true,
        supportedSyncTypes: [WearableStateSyncType.SleepAnalysis],
        syncTypes: [WearableStateSyncType.SleepAnalysis]
      },
      {
        ehrId: 'ehr2',
        enabled: false,
        supportedSyncTypes: [
          WearableStateSyncType.BodyMass,
          WearableStateSyncType.Workout
        ],
        syncTypes: [
          WearableStateSyncType.BodyMass,
          WearableStateSyncType.Workout
        ]
      },
      {
        ehrId: 'ehr3',
        enabled: false,
        status: WearableIntegrationStatus.NeedsAuthorization,
        supportedSyncTypes: [WearableStateSyncType.MindfulSession],
        syncTypes: [WearableStateSyncType.MindfulSession]
      }
    ] as WearableIntegration[];

    expect(getSyncTypesFromWearables(wearables)).toEqual({
      [WearableStateSyncType.SleepAnalysis]: 'ehr1',
      [WearableStateSyncType.MindfulSession]: 'ehr3'
    });
  });

  it('should remove unsupported syncTypes from wearables settings', () => {
    const wearables = [
      {
        ehrId: 'ehr1',
        enabled: true,
        syncTypes: [
          WearableStateSyncType.BodyMass,
          WearableStateSyncType.BloodGlucose
        ],
        supportedSyncTypes: [WearableStateSyncType.BodyMass]
      }
    ] as WearableIntegration[];
    expect(getSyncTypesFromWearables(wearables)).toEqual({
      [WearableStateSyncType.BodyMass]: 'ehr1'
    });
  });
});

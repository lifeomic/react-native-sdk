import React from 'react';
import { waitFor, render, fireEvent } from '@testing-library/react-native';
import cloneDeep from 'lodash/cloneDeep';
import {
  sanitizeWearables,
  WearablesView,
  WearablesViewProps
} from '../src/WearablesView';
import {
  WearableIntegration,
  WearableIntegrationStatus
} from '@lifeomic/wearables-sync';
import { EHRType, WearableStateSyncType } from '@lifeomic/ehr-core';

const fitbit = {
  ehrId: EHRType.Fitbit,
  ehrType: EHRType.Fitbit,
  name: 'Fitbit',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout
  ],
  syncTypes: [
    WearableStateSyncType.Workout,
    WearableStateSyncType.SleepAnalysis
  ]
};
const healthKit = {
  ehrId: EHRType.HealthKit,
  ehrType: EHRType.HealthKit,
  name: 'Apple Health',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.MindfulSession,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout
  ],
  syncTypes: [WearableStateSyncType.BodyMass]
};
const samsungHealth = {
  ehrId: EHRType.SamsungHealth,
  ehrType: EHRType.SamsungHealth,
  name: 'Samsung Health',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.MindfulSession,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout
  ],
  syncTypes: [WearableStateSyncType.MindfulSession]
};
const readoutHealth = {
  ehrId: EHRType.ReadoutHealth,
  ehrType: EHRType.ReadoutHealth,
  name: 'Biosense',
  enabled: false,
  supportedSyncTypes: [WearableStateSyncType.BreathKetones],
  syncTypes: [WearableStateSyncType.BreathKetones]
};
const ketoMojo = {
  ehrId: EHRType.KetoMojo,
  ehrType: EHRType.KetoMojo,
  name: 'Keto-Mojo',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BloodGlucose,
    WearableStateSyncType.BloodKetones
  ],
  syncTypes: [
    WearableStateSyncType.BloodGlucose,
    WearableStateSyncType.BloodKetones
  ]
};
const garmin = {
  ehrId: EHRType.Garmin,
  ehrType: EHRType.Garmin,
  name: 'Garmin',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout
  ],
  syncTypes: [WearableStateSyncType.SleepAnalysis]
};

const nativeWearablesSync = {
  isHealthKitAllowed: jest.fn(),
  isSamsungHealthAllowed: jest.fn(),
  authorizeHealthKit: jest.fn(),
  requestPermissions: jest.fn()
};

const getEnabledWearable = (baseProps: any) => {
  return {
    ...baseProps,
    enabled: true,
    status: WearableIntegrationStatus.Syncing
  };
};

const viewActions = {
  onError: jest.fn(),
  onRefreshNeeded: jest.fn(),
  onShowWearableAuth: jest.fn(),
  onShowLearnMore: jest.fn(),
  onSyncTypeSelectionsUpdate: jest.fn(),
  onToggleWearable: jest.fn()
};

const baseProps = {
  ...viewActions,
  loading: false,
  wearables: [fitbit, healthKit, samsungHealth, readoutHealth, ketoMojo]
} as WearablesViewProps;

beforeEach(() => {
  nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(false);
  nativeWearablesSync.isSamsungHealthAllowed.mockResolvedValue(false);
  nativeWearablesSync.authorizeHealthKit.mockResolvedValue({});
  nativeWearablesSync.requestPermissions.mockResolvedValue({});
});

describe('WearablesView', () => {
  it('should render wearable rows', async () => {
    const { getByA11yLabel, getByText } = await render(
      <WearablesView {...baseProps} />
    );
    expect(getByA11yLabel('Toggle Fitbit')).toBeDefined();
    expect(getByA11yLabel('Toggle Biosense')).toBeDefined();
    expect(getByA11yLabel('Toggle Keto-Mojo')).toBeDefined();

    expect(getByText('Authorize')).toBeDefined();
  });

  it('displays messages about wearables that need attention', async () => {
    const fitbitNeedsAuth = {
      ...fitbit,
      enabled: true,
      status: WearableIntegrationStatus.NeedsAuthorization
    };
    const readoutWithNoSyncTypes = {
      ...readoutHealth,
      enabled: true,
      syncTypes: []
    };
    const props = {
      ...baseProps,
      wearables: [fitbitNeedsAuth, readoutWithNoSyncTypes]
    };
    const { getByA11yLabel, getByText } = await render(
      <WearablesView {...props} />
    );
    expect(getByA11yLabel('Toggle Fitbit')).toBeDefined();
    expect(getByA11yLabel('Toggle Biosense')).toBeDefined();

    expect(
      getByText(
        'Your data is not syncing. Please toggle back on to reauthorize.'
      )
    ).toBeDefined();
    expect(
      getByText(
        'Your data is not syncing because it is not configured as a Data Source above.'
      )
    ).toBeDefined();
  });

  it('should call onError if error occurs sanitizing values', async () => {
    const error = new Error('uh oh');
    nativeWearablesSync.isHealthKitAllowed.mockRejectedValue(error);
    const props = {
      ...baseProps,
      nativeWearablesSync
    };

    const { getByTestId } = await render(<WearablesView {...props} />);
    await waitFor(() => getByTestId('wearables-screen-container'));

    expect(viewActions.onError).toHaveBeenCalledTimes(1);
    expect(viewActions.onError.mock.calls[0]).toEqual([error]);
  });

  describe('enableMultiWearable=true', () => {
    let multiBaseProps: any;
    beforeEach(() => {
      nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
      multiBaseProps = {
        enableMultiWearable: true,
        nativeWearablesSync,

        // We're about to mutate.. cloneDeep to not affect other tests
        ...cloneDeep(baseProps)
      };

      // Make both fitbit and HealthKit enabled:
      multiBaseProps.wearables
        .filter(
          (w: WearableIntegration) =>
            w.ehrType === EHRType.HealthKit || w.ehrType === EHRType.Fitbit
        )
        .forEach((w: WearableIntegration) => (w.enabled = true));
    });

    it('should render wearable rows and source selection options', async () => {
      const { getByText, getByA11yLabel } = await render(
        <WearablesView {...multiBaseProps} />
      );

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());

      expect(getByA11yLabel('Fitbit - Activity')).toBeDefined();
      expect(getByA11yLabel('Fitbit - Sleep')).toBeDefined();
      expect(getByA11yLabel('Apple Health - Weight')).toBeDefined();

      expect(getByText('Authorize')).toBeDefined();

      expect(getByA11yLabel('Toggle Fitbit')).toBeDefined();
      expect(getByA11yLabel('Toggle Biosense')).toBeDefined();
      expect(getByA11yLabel('Toggle Keto-Mojo')).toBeDefined();
    });

    it('should call onSyncTypeSelectionsUpdate when settings are updated', async () => {
      const { getByText, getByA11yLabel } = await render(
        <WearablesView {...multiBaseProps} />
      );

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());

      const sleepSelection = getByA11yLabel('Fitbit - Sleep');
      expect(sleepSelection).toBeDefined();
      fireEvent.press(sleepSelection);

      const appleHealthOption = getByA11yLabel('Apple Health');
      expect(appleHealthOption).toBeDefined();
      fireEvent.press(appleHealthOption);

      expect(viewActions.onSyncTypeSelectionsUpdate).toHaveBeenCalledTimes(1);
      expect(viewActions.onSyncTypeSelectionsUpdate.mock.calls[0]).toEqual([
        {
          bodyMass: 'healthKit',
          mindfulSession: 'none',
          sleepAnalysis: 'healthKit',
          workout: 'fitbit'
        }
      ]);
    });

    it('should call onError if onSyncTypeSelectionsUpdate throws', async () => {
      const error = new Error('api is down');
      viewActions.onSyncTypeSelectionsUpdate.mockRejectedValue(error);
      const { getByText, getByA11yLabel } = await render(
        <WearablesView {...multiBaseProps} />
      );

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());

      const sleepSelection = getByA11yLabel('Fitbit - Sleep');
      expect(sleepSelection).toBeDefined();
      fireEvent.press(sleepSelection);

      const appleHealthOption = getByA11yLabel('Apple Health');
      expect(appleHealthOption).toBeDefined();
      fireEvent.press(appleHealthOption);

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());
      expect(viewActions.onSyncTypeSelectionsUpdate).toHaveBeenCalledTimes(1);
      expect(viewActions.onError).toHaveBeenCalledTimes(1);
      expect(viewActions.onError.mock.calls[0]).toEqual([error]);
    });
  });
});

describe('sanitizeWearables', () => {
  it('should allow nativeWearablesSync to be undefined', async () => {
    const result = await sanitizeWearables([fitbit, healthKit, samsungHealth]);

    // NOTE: native options filtered out:
    expect(result).toEqual([fitbit]);
  });

  it('should filter out healthKit if not on iOS', async () => {
    nativeWearablesSync.isSamsungHealthAllowed.mockResolvedValue(true);
    const result = await sanitizeWearables(
      [fitbit, healthKit, samsungHealth],
      nativeWearablesSync
    );

    expect(result).toEqual([fitbit, samsungHealth]);
  });

  it('should filter out samsungHealth if not on Android', async () => {
    nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
    const result = await sanitizeWearables(
      [healthKit, fitbit, samsungHealth],
      nativeWearablesSync
    );

    expect(result).toEqual([healthKit, fitbit]);
  });

  it('always shows readoutHealth', async () => {
    const result = await sanitizeWearables(
      [getEnabledWearable(fitbit), readoutHealth],
      nativeWearablesSync
    );

    expect(result).toEqual([readoutHealth, getEnabledWearable(fitbit)]);
  });

  it('always shows ketoMojo', async () => {
    const result = await sanitizeWearables(
      [getEnabledWearable(fitbit), ketoMojo],
      nativeWearablesSync
    );

    expect(result).toEqual([getEnabledWearable(fitbit), ketoMojo]);
  });

  it('shows other wearables when only readoutHealth is enabled', async () => {
    const result = await sanitizeWearables(
      [getEnabledWearable(readoutHealth), fitbit],
      nativeWearablesSync
    );

    expect(result).toEqual([getEnabledWearable(readoutHealth), fitbit]);
  });

  it('shows other wearables when only ketoMojo is enabled', async () => {
    const result = await sanitizeWearables(
      [getEnabledWearable(ketoMojo), fitbit],
      nativeWearablesSync
    );

    expect(result).toEqual([fitbit, getEnabledWearable(ketoMojo)]);
  });

  it('if legacySort=true, sorts wearables by attention-needed, enabled, then alphabetical', async () => {
    nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
    const enabledKetoMojo = getEnabledWearable(ketoMojo);
    const fitbitNeedsAuth = {
      ...fitbit,
      status: WearableIntegrationStatus.NeedsAuthorization
    };
    const readoutWithNoSyncTypes = {
      ...readoutHealth,
      syncTypes: []
    };
    const result = await sanitizeWearables(
      [
        garmin,
        healthKit,
        enabledKetoMojo,
        fitbitNeedsAuth,
        readoutWithNoSyncTypes
      ],
      nativeWearablesSync,
      true, // enableMultiWearable
      true // legacySort param
    );

    expect(result).toEqual([
      // Needs attention brought to the top:
      readoutWithNoSyncTypes,
      fitbitNeedsAuth,

      // Next comes enabled wearables:
      enabledKetoMojo,

      // Then sort alphabetical:
      healthKit,
      garmin
    ]);
  });

  it('without legacySort, sorts wearables only by name', async () => {
    nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
    const enabledKetoMojo = getEnabledWearable(ketoMojo);
    const fitbitNeedsAuth = {
      ...fitbit,
      status: WearableIntegrationStatus.NeedsAuthorization
    };
    const readoutWithNoSyncTypes = {
      ...readoutHealth,
      syncTypes: []
    };
    const result = await sanitizeWearables(
      [
        garmin,
        healthKit,
        enabledKetoMojo,
        fitbitNeedsAuth,
        readoutWithNoSyncTypes
      ],
      nativeWearablesSync,
      true // enableMultiWearable
      // missing legacySort param
    );

    expect(result).toEqual([
      // All alphabetical, regardless of enabled & issue:
      healthKit, // "Apple Health"
      readoutWithNoSyncTypes, // "Biosense"
      fitbitNeedsAuth,
      garmin,
      enabledKetoMojo
    ]);
  });
});

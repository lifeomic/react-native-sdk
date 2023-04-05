import React from 'react';
import { waitFor, render, fireEvent } from '@testing-library/react-native';
import cloneDeep from 'lodash/cloneDeep';
import {
  sanitizeWearables,
  WearablesView,
  WearablesViewProps,
} from './WearablesView';
import {
  WearableIntegration,
  WearableIntegrationStatus,
  EHRType,
  WearableStateSyncType,
} from './WearableTypes';

const fitbit = {
  ehrId: EHRType.Fitbit,
  ehrType: EHRType.Fitbit,
  name: 'Fitbit',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout,
  ],
  syncTypes: [
    WearableStateSyncType.Workout,
    WearableStateSyncType.SleepAnalysis,
  ],
};
const readoutHealth = {
  ehrId: EHRType.ReadoutHealth,
  ehrType: EHRType.ReadoutHealth,
  name: 'Biosense',
  enabled: false,
  supportedSyncTypes: [WearableStateSyncType.BreathKetones],
  syncTypes: [WearableStateSyncType.BreathKetones],
};
const ketoMojo = {
  ehrId: EHRType.KetoMojo,
  ehrType: EHRType.KetoMojo,
  name: 'Keto-Mojo',
  enabled: true,
  supportedSyncTypes: [
    WearableStateSyncType.BloodGlucose,
    WearableStateSyncType.BloodKetones,
  ],
  syncTypes: [WearableStateSyncType.BloodKetones],
};
const garmin = {
  ehrId: EHRType.Garmin,
  ehrType: EHRType.Garmin,
  name: 'Garmin',
  enabled: false,
  supportedSyncTypes: [
    WearableStateSyncType.BodyMass,
    WearableStateSyncType.SleepAnalysis,
    WearableStateSyncType.Workout,
  ],
  syncTypes: [WearableStateSyncType.SleepAnalysis],
};

const getEnabledWearable = (baseProps: any) => {
  return {
    ...baseProps,
    enabled: true,
    status: WearableIntegrationStatus.Syncing,
  };
};

const viewActions = {
  onError: jest.fn(),
  onRefreshNeeded: jest.fn(),
  onShowWearableAuth: jest.fn(),
  onShowLearnMore: jest.fn(),
  onSyncTypeSelectionsUpdate: jest.fn(),
  onToggleWearable: jest.fn(),
};

const baseProps = {
  ...viewActions,
  loading: false,
  wearables: [fitbit, readoutHealth, ketoMojo],
} as WearablesViewProps;

describe('WearablesView', () => {
  it('should render wearable rows', async () => {
    const { getByLabelText, getByText } = await render(
      <WearablesView {...baseProps} />,
    );
    expect(getByLabelText('Toggle Fitbit')).toBeDefined();
    expect(getByLabelText('Toggle Biosense')).toBeDefined();
    expect(getByLabelText('Toggle Keto-Mojo')).toBeDefined();

    expect(getByText('Authorize')).toBeDefined();
  });

  it('displays messages about wearables that need attention', async () => {
    const fitbitNeedsAuth = {
      ...fitbit,
      enabled: true,
      status: WearableIntegrationStatus.NeedsAuthorization,
    };
    const readoutWithNoSyncTypes = {
      ...readoutHealth,
      enabled: true,
      syncTypes: [],
    };
    const props = {
      ...baseProps,
      wearables: [fitbitNeedsAuth, readoutWithNoSyncTypes],
    };
    const { getByText, getByLabelText } = render(<WearablesView {...props} />);
    await waitFor(() => expect(getByLabelText('Toggle Fitbit')).toBeDefined());
    expect(getByLabelText('Toggle Biosense')).toBeDefined();

    expect(
      getByText(
        'Your data is not syncing. Please toggle back on to reauthorize.',
      ),
    ).toBeDefined();
    expect(
      getByText(
        'Your data is not syncing because it is not configured as a Data Source above.',
      ),
    ).toBeDefined();
  });

  describe('enableMultiWearable=true', () => {
    let multiBaseProps: any;
    beforeEach(() => {
      multiBaseProps = {
        enableMultiWearable: true,

        // We're about to mutate.. cloneDeep to not affect other tests
        ...cloneDeep(baseProps),
      };

      // Make both fitbit and readoutHealth enabled:
      multiBaseProps.wearables
        .filter(
          (w: WearableIntegration) =>
            w.ehrType === EHRType.Fitbit || w.ehrType === EHRType.ReadoutHealth,
        )
        .forEach((w: WearableIntegration) => (w.enabled = true));
    });

    it('should render wearable rows and source selection options', async () => {
      const { getByText, getByLabelText } = render(
        <WearablesView {...multiBaseProps} />,
      );

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());

      expect(getByLabelText('Fitbit - Activity')).toBeDefined();
      expect(getByLabelText('Fitbit - Sleep')).toBeDefined();

      expect(getByLabelText('Biosense - Breath Ketones')).toBeDefined();

      expect(getByText('Authorize')).toBeDefined();

      expect(getByLabelText('Toggle Fitbit')).toBeDefined();
      expect(getByLabelText('Toggle Biosense')).toBeDefined();
      expect(getByLabelText('Toggle Keto-Mojo')).toBeDefined();
    });

    it('should call onSyncTypeSelectionsUpdate when settings are updated', async () => {
      const { getByText, getByLabelText } = render(
        <WearablesView {...multiBaseProps} />,
      );
      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());

      // Step 1. Click selection that is already enabled
      // and expect that onSyncTypeUpdate was not called
      fireEvent.press(getByText('Sleep')); // Expand sleep section
      const sleepSelection = getByLabelText('Fitbit');
      expect(sleepSelection).toBeDefined();
      fireEvent.press(sleepSelection); // and re-select Fitbit
      fireEvent.press(getByText('Sleep')); // Collapse sleep section
      expect(viewActions.onSyncTypeSelectionsUpdate).toHaveBeenCalledTimes(0);

      // Step 2. Make a new selection
      // and expect that onSyncTypeUpdate was called
      fireEvent.press(getByText('Glucose')); // Expand weight section
      const glucoseSelection = getByLabelText('Keto-Mojo');
      expect(glucoseSelection).toBeDefined();
      fireEvent.press(glucoseSelection);
      await waitFor(() =>
        expect(viewActions.onSyncTypeSelectionsUpdate).toHaveBeenCalledTimes(1),
      );

      expect(viewActions.onSyncTypeSelectionsUpdate.mock.calls[0]).toEqual([
        {
          bloodGlucose: 'ketoMojo',
          bloodKetones: 'ketoMojo',
          bodyMass: 'none',
          breathKetones: 'readoutHealth',
          sleepAnalysis: 'fitbit',
          workout: 'fitbit',
        },
      ]);
    });

    it('should call onError if onSyncTypeSelectionsUpdate throws', async () => {
      const error = new Error('api is down');
      viewActions.onSyncTypeSelectionsUpdate.mockRejectedValue(error);
      const { getByText, getByLabelText } = await render(
        <WearablesView {...multiBaseProps} />,
      );

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());

      fireEvent.press(getByText('Sleep')); // Expand sleep section
      const sleepSelection = getByLabelText('Fitbit');
      expect(sleepSelection).toBeDefined();
      fireEvent.press(sleepSelection); // and re-select Fitbit
      fireEvent.press(getByText('Sleep')); // Collapse sleep section

      fireEvent.press(getByText('Glucose')); // Expand weight section
      const weightSelection = getByLabelText('Keto-Mojo');
      expect(weightSelection).toBeDefined();
      fireEvent.press(weightSelection);
      await waitFor(() =>
        expect(viewActions.onSyncTypeSelectionsUpdate).toHaveBeenCalledTimes(1),
      );

      await waitFor(() => expect(getByText('Data Sources')).toBeDefined());
      expect(viewActions.onSyncTypeSelectionsUpdate).toHaveBeenCalledTimes(1);
      expect(viewActions.onError).toHaveBeenCalledTimes(1);
      expect(viewActions.onError.mock.calls[0]).toEqual([error]);
    });
  });
});

describe('sanitizeWearables', () => {
  it('always shows readoutHealth', async () => {
    const result = await sanitizeWearables([
      getEnabledWearable(fitbit),
      readoutHealth,
    ]);

    expect(result).toEqual([readoutHealth, getEnabledWearable(fitbit)]);
  });

  it('always shows ketoMojo', async () => {
    const result = await sanitizeWearables([
      getEnabledWearable(fitbit),
      ketoMojo,
    ]);

    expect(result).toEqual([getEnabledWearable(fitbit), ketoMojo]);
  });

  it('shows other wearables when only readoutHealth is enabled', async () => {
    const result = await sanitizeWearables([
      getEnabledWearable(readoutHealth),
      fitbit,
    ]);

    expect(result).toEqual([getEnabledWearable(readoutHealth), fitbit]);
  });

  it('shows other wearables when only ketoMojo is enabled', async () => {
    const result = await sanitizeWearables([
      getEnabledWearable(ketoMojo),
      fitbit,
    ]);

    expect(result).toEqual([fitbit, getEnabledWearable(ketoMojo)]);
  });

  it('if legacySort=true, sorts wearables by attention-needed, enabled, then alphabetical', async () => {
    const enabledKetoMojo = getEnabledWearable(ketoMojo);
    const fitbitNeedsAuth = {
      ...fitbit,
      status: WearableIntegrationStatus.NeedsAuthorization,
    };
    const readoutWithNoSyncTypes = {
      ...readoutHealth,
      syncTypes: [],
    };
    const result = await sanitizeWearables(
      [garmin, enabledKetoMojo, fitbitNeedsAuth, readoutWithNoSyncTypes],
      true, // enableMultiWearable
      true, // legacySort param
    );

    expect(result).toEqual([
      // Needs attention brought to the top:
      readoutWithNoSyncTypes,
      fitbitNeedsAuth,

      // Next comes enabled wearables:
      enabledKetoMojo,

      // Then sort alphabetical:
      garmin,
    ]);
  });

  it('without legacySort, sorts wearables only by name', async () => {
    const enabledKetoMojo = getEnabledWearable(ketoMojo);
    const fitbitNeedsAuth = {
      ...fitbit,
      status: WearableIntegrationStatus.NeedsAuthorization,
    };
    const readoutWithNoSyncTypes = {
      ...readoutHealth,
      syncTypes: [],
    };
    const result = await sanitizeWearables(
      [garmin, enabledKetoMojo, fitbitNeedsAuth, readoutWithNoSyncTypes],
      true, // enableMultiWearable
      // missing legacySort param
    );

    expect(result).toEqual([
      // All alphabetical, regardless of enabled & issue:
      readoutWithNoSyncTypes, // "Biosense"
      fitbitNeedsAuth,
      garmin,
      enabledKetoMojo,
    ]);
  });
});

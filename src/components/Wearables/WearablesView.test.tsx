import React from 'react';
import { waitFor, render, fireEvent } from '@testing-library/react-native';
import cloneDeep from 'lodash/cloneDeep';
import { WearablesView, WearablesViewProps } from './WearablesView';
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
  let multiBaseProps: any;
  beforeEach(() => {
    multiBaseProps = {
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

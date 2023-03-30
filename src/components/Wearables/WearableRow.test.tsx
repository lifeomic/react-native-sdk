import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { WearableRow, WearableRowProps } from './WearableRow';
import { WearableIntegrationStatus } from '@lifeomic/wearables-sync';
import { act } from 'react-test-renderer';
import { EHRType, WearableStateSyncType } from '@lifeomic/ehr-core';

const rowActions = {
  onError: jest.fn(),
  onRefreshNeeded: jest.fn(),
  onShowWearableAuth: jest.fn(),
  onShowLearnMore: jest.fn(),
  onToggleWearable: jest.fn(),
  onToggleBackgroundSync: jest.fn(),
};

const exampleWearable = {
  ehrId: EHRType.Fitbit,
  ehrType: EHRType.Fitbit,
  name: 'Fitbit',
  enabled: true,
  status: WearableIntegrationStatus.Syncing,
};

const baseProps = {
  ...rowActions,
  wearable: exampleWearable,
} as WearableRowProps;

const getWearable = (ehrType: string) => {
  return {
    ...exampleWearable,
    ehrType,
    ehrId: ehrType,
  };
};

const nativeWearablesSync = {
  isHealthKitAllowed: jest.fn(),
  isSamsungHealthAllowed: jest.fn(),
  authorizeHealthKit: jest.fn(),
  requestPermissions: jest.fn(),
};

beforeEach(() => {
  rowActions.onRefreshNeeded.mockResolvedValue({});
  rowActions.onToggleWearable.mockResolvedValue({});

  nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(false);
  nativeWearablesSync.isSamsungHealthAllowed.mockResolvedValue(false);
  nativeWearablesSync.authorizeHealthKit.mockResolvedValue({});
  nativeWearablesSync.requestPermissions.mockResolvedValue({});
});

describe('WearableRow', () => {
  it('should render a wearable row', () => {
    const { getByA11yLabel, getByText } = render(
      <WearableRow {...baseProps} />,
    );

    expect(getByA11yLabel('Toggle Fitbit')).toBeDefined();
    expect(
      getByText(
        "Fitbit records will be ingested once they are available from Fitbit's cloud. You may need to sync with the Fitbit app if records appear to be missing.",
      ),
    ).toBeDefined();
    expect(getByText('Learn More')).toBeDefined();
  });

  it('should display error message in wearable row if it needs auth', () => {
    const { getByA11yLabel, getByText } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          status: WearableIntegrationStatus.NeedsAuthorization,
        }}
      />,
    );

    expect(getByA11yLabel('Toggle Fitbit')).toBeDefined();
    expect(
      getByText(
        'Your data is not syncing. Please toggle back on to reauthorize.',
      ),
    ).toBeDefined();
  });

  it('should display error message in wearable row if not configured for any syncTypes', () => {
    const { getByA11yLabel, getByText } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          syncTypes: [],
        }}
      />,
    );

    expect(getByA11yLabel('Toggle Fitbit')).toBeDefined();
    expect(
      getByText(
        'Your data is not syncing because it is not configured as a Data Source above.',
      ),
    ).toBeDefined();
  });

  it('should render all wearable ehr types', () => {
    const wearableTypes = [
      EHRType.HealthKit,
      EHRType.Fitbit,
      EHRType.Oura,
      EHRType.Garmin,
      EHRType.ReadoutHealth,
      EHRType.KetoMojo,
      EHRType.SamsungHealth,
      EHRType.GoogleFit,
      EHRType.Dexcom,
    ];

    for (const ehrType of wearableTypes) {
      const wearable = getWearable(ehrType);
      const { getByTestId } = render(
        <WearableRow {...baseProps} wearable={wearable} />,
      );

      expect(getByTestId(`toggle-${ehrType}`)).toBeDefined();
    }
  });

  it('should render unexpected ehr type', () => {
    const ehrType = 'valid-but-unexpected-type-that-shouldnt-blow-things-up';
    const wearable = getWearable(ehrType);
    const { getByTestId } = render(
      <WearableRow {...baseProps} wearable={wearable} />,
    );

    expect(getByTestId(`toggle-${ehrType}`)).toBeDefined();
  });

  it('should allow for enabling oauth-based wearable', async () => {
    rowActions.onToggleWearable.mockResolvedValue({
      authorizationUrl: 'link-to-authorize-phc',
    });
    const wearable = {
      ...getWearable(EHRType.Fitbit),
      enabled: false,
    };
    const { getByTestId } = render(
      <WearableRow {...baseProps} wearable={wearable} />,
    );

    const toggle = getByTestId('toggle-fitbit');
    expect(toggle).toBeDefined();

    await act(async () => {
      fireEvent(toggle, 'onPress');
    });

    expect(rowActions.onShowWearableAuth).toHaveBeenCalledTimes(1);
    expect(rowActions.onShowWearableAuth.mock.calls[0]).toEqual([
      'link-to-authorize-phc',
    ]);

    expect(rowActions.onToggleWearable).toHaveBeenCalledTimes(1);
    expect(rowActions.onToggleWearable.mock.calls[0]).toEqual(['fitbit', true]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);
  });

  it('should allow for enabling (native) healthKit', async () => {
    nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
    const { getByTestId } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          ehrId: EHRType.HealthKit,
          ehrType: EHRType.HealthKit,
          enabled: false,
        }}
        nativeSyncTypesToRequest={[WearableStateSyncType.BodyMass]}
        nativeWearablesSync={nativeWearablesSync}
      />,
    );

    const toggle = getByTestId('toggle-healthKit');
    expect(toggle).toBeDefined();

    await act(async () => {
      fireEvent(toggle, 'onPress');
    });

    expect(nativeWearablesSync.isHealthKitAllowed).toHaveBeenCalledTimes(1);
    expect(nativeWearablesSync.authorizeHealthKit).toHaveBeenCalledTimes(1);
    expect(nativeWearablesSync.authorizeHealthKit.mock.calls[0]).toEqual([
      [WearableStateSyncType.BodyMass],
    ]);

    expect(rowActions.onToggleWearable).toHaveBeenCalledTimes(1);
    expect(rowActions.onToggleWearable.mock.calls[0]).toEqual([
      'healthKit',
      true,
    ]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);
  });

  it('should allow for toggling (native) healthKit background sync', async () => {
    nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
    const healthKit = {
      ...exampleWearable,
      ehrId: EHRType.HealthKit,
      ehrType: EHRType.HealthKit,
      enabled: true,
    };
    const { queryByTestId } = render(
      <WearableRow
        {...baseProps}
        wearable={healthKit}
        nativeSyncTypesToRequest={[WearableStateSyncType.BodyMass]}
        nativeWearablesSync={nativeWearablesSync}
      />,
    );

    // NOTE: using queryByTestId as a sanity check that it works,
    // so the test showing it returns null is futher verified.
    const backgroundToggle = queryByTestId(
      'toggle-healthKit-background-sync-switch',
    );
    expect(backgroundToggle).toBeDefined();

    // Toggle on:
    await act(async () => {
      fireEvent(backgroundToggle!, 'onValueChange', true);
    });
    expect(rowActions.onToggleBackgroundSync).toHaveBeenCalledTimes(1);
    expect(rowActions.onToggleBackgroundSync.mock.calls[0]).toEqual([
      healthKit,
      true,
    ]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);

    // Toggle off:
    await act(async () => {
      fireEvent(backgroundToggle!, 'onValueChange', false);
    });

    expect(rowActions.onToggleBackgroundSync).toHaveBeenCalledTimes(2);
    expect(rowActions.onToggleBackgroundSync.mock.calls[1]).toEqual([
      healthKit,
      false,
    ]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(2);
  });

  it('should not render background sync if onToggleBackgroundSync not passed', async () => {
    nativeWearablesSync.isHealthKitAllowed.mockResolvedValue(true);
    const { queryByTestId } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          ehrId: EHRType.HealthKit,
          ehrType: EHRType.HealthKit,
          enabled: true,
        }}
        nativeSyncTypesToRequest={[WearableStateSyncType.BodyMass]}
        nativeWearablesSync={nativeWearablesSync}
        // NOTE: overriding baseProps here:
        onToggleBackgroundSync={undefined}
      />,
    );

    const backgroundToggle = queryByTestId(
      'toggle-healthKit-background-sync-switch',
    );
    expect(backgroundToggle).toBeNull();
  });

  it('should allow for enabling (native) samsungHealth', async () => {
    nativeWearablesSync.isSamsungHealthAllowed.mockResolvedValue(true);
    const { getByTestId } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          ehrId: EHRType.SamsungHealth,
          ehrType: EHRType.SamsungHealth,
          enabled: false,
        }}
        nativeSyncTypesToRequest={[
          WearableStateSyncType.BodyMass,
          WearableStateSyncType.SleepAnalysis,
          WearableStateSyncType.Workout,
          'unsupported-type-doesnt-explode-just-gets-ignored',
        ]}
        nativeWearablesSync={nativeWearablesSync}
      />,
    );

    const toggle = getByTestId('toggle-shealth');
    expect(toggle).toBeDefined();

    await act(async () => {
      fireEvent(toggle, 'onPress');
    });

    expect(nativeWearablesSync.requestPermissions).toHaveBeenCalledTimes(1);
    expect(nativeWearablesSync.requestPermissions.mock.calls[0]).toEqual([
      'shealth',
      ['weight', 'sleep', 'exercise'],
    ]);

    expect(rowActions.onToggleWearable).toHaveBeenCalledTimes(1);
    expect(rowActions.onToggleWearable.mock.calls[0]).toEqual([
      'shealth',
      true,
    ]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);
  });

  it('should allow for clicking learn more link', () => {
    const { getByTestId } = render(<WearableRow {...baseProps} />);

    const learnMoreLink = getByTestId('info-link-fitbit');
    expect(learnMoreLink).toBeDefined();

    fireEvent.press(learnMoreLink);

    expect(rowActions.onShowLearnMore).toHaveBeenCalledTimes(1);
    expect(rowActions.onShowLearnMore.mock.calls[0]).toEqual([
      'https://lifeapps.io/ia/wearables-sync-fitbit/',
    ]);
  });

  it('should call onError if error occurs toggling', async () => {
    const error = new Error('uh oh');
    rowActions.onToggleWearable.mockRejectedValue(error);
    const wearable = {
      ...getWearable(EHRType.Fitbit),
      enabled: false,
    };
    const { getByTestId } = render(
      <WearableRow {...baseProps} wearable={wearable} />,
    );

    const toggle = getByTestId('toggle-fitbit');
    expect(toggle).toBeDefined();

    await act(async () => {
      fireEvent(toggle, 'onPress');
    });

    expect(rowActions.onError).toHaveBeenCalledTimes(1);
    expect(rowActions.onError.mock.calls[0]).toEqual([error, 'fitbit', true]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);
  });

  it('should call onError if error occurs toggling background-sync', async () => {
    const error = new Error('uh oh');
    rowActions.onToggleBackgroundSync.mockRejectedValue(error);
    const { getByTestId } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          ehrId: EHRType.HealthKit,
          ehrType: EHRType.HealthKit,
          enabled: true,
        }}
      />,
    );

    const toggle = getByTestId('toggle-healthKit-background-sync-switch');
    expect(toggle).toBeDefined();

    await act(async () => {
      fireEvent(toggle, 'onValueChange', true);
    });

    expect(rowActions.onError).toHaveBeenCalledTimes(1);
    expect(rowActions.onError.mock.calls[0]).toEqual([
      error,
      'healthKit',
      true,
    ]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { WearableRow, WearableRowProps } from './WearableRow';
import { EHRType, WearableIntegrationStatus } from './WearableTypes';

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

beforeEach(() => {
  rowActions.onRefreshNeeded.mockResolvedValue({});
  rowActions.onToggleWearable.mockResolvedValue({});
});

describe('WearableRow', () => {
  it('should render a wearable row', () => {
    const { getByLabelText, getByText } = render(
      <WearableRow {...baseProps} />,
    );

    expect(getByLabelText('Toggle Fitbit')).toBeDefined();
    expect(
      getByText(
        "Fitbit records will be ingested once they are available from Fitbit's cloud. You may need to sync with the Fitbit app if records appear to be missing.",
      ),
    ).toBeDefined();
    expect(getByText('Learn More')).toBeDefined();
  });

  it('should display error message in wearable row if it needs auth', () => {
    const { getByLabelText, getByText } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          status: WearableIntegrationStatus.NeedsAuthorization,
        }}
      />,
    );

    expect(getByLabelText('Toggle Fitbit')).toBeDefined();
    expect(
      getByText(
        'Your data is not syncing. Please toggle back on to reauthorize.',
      ),
    ).toBeDefined();
  });

  it('should display error message in wearable row if not configured for any syncTypes', () => {
    const { getByLabelText, getByText } = render(
      <WearableRow
        {...baseProps}
        wearable={{
          ...exampleWearable,
          syncTypes: [],
        }}
      />,
    );

    expect(getByLabelText('Toggle Fitbit')).toBeDefined();
    expect(
      getByText(
        'Your data is not syncing because it is not configured as a Data Source above.',
      ),
    ).toBeDefined();
  });

  it('should render all wearable ehr types', () => {
    const wearableTypes = [
      EHRType.Fitbit,
      EHRType.Oura,
      EHRType.Garmin,
      EHRType.ReadoutHealth,
      EHRType.KetoMojo,
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

    fireEvent.press(toggle);

    await waitFor(() => {
      expect(rowActions.onShowWearableAuth).toHaveBeenCalledTimes(1);
    });

    expect(rowActions.onShowWearableAuth.mock.calls[0]).toEqual([
      'link-to-authorize-phc',
    ]);

    expect(rowActions.onToggleWearable).toHaveBeenCalledTimes(1);
    expect(rowActions.onToggleWearable.mock.calls[0]).toEqual(['fitbit', true]);
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

    fireEvent.press(toggle);
    await waitFor(() => {
      expect(rowActions.onError).toHaveBeenCalledTimes(1);
    });

    expect(rowActions.onError.mock.calls[0]).toEqual([error, 'fitbit', true]);
    expect(rowActions.onRefreshNeeded).toHaveBeenCalledTimes(1);
  });
});

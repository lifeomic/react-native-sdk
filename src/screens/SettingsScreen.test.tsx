import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import DeviceInfo from 'react-native-device-info';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useWearables } from '../hooks/useWearables';
import { SettingsScreen } from './SettingsScreen';

jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useWearables', () => ({
  useWearables: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useWearablesMock = useWearables as jest.Mock;
const getVersionMock = DeviceInfo.getVersion as jest.Mock;

beforeEach(() => {
  getVersionMock.mockReturnValue('1.0');
  useActiveAccountMock.mockReturnValue({
    account: { name: 'Account Name' },
  });
  useWearablesMock.mockReturnValue({
    useWearableIntegrationsQuery: jest.fn().mockReturnValue({
      data: undefined,
    }),
  });
});

const innerNavigateMock = jest.fn();
const navigationMock = {
  getParent: () => ({
    navigate: innerNavigateMock,
  }),
};

test('shows logout button and version', async () => {
  const { getByTestId } = await render(
    <SettingsScreen navigation={navigationMock as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByTestId('oauth-logout-button')).toBeDefined();
    expect(getByTestId('version-text')).toBeDefined();
  });
});

test('shows account name', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={navigationMock as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Account Name')).toBeDefined();
  });
});

test('shows placeholder if account still loading', async () => {
  useActiveAccountMock.mockReturnValue({});
  const { getByText } = await render(
    <SettingsScreen navigation={navigationMock as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Accounts')).toBeDefined();
  });
});

test('navigates to user profile', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={navigationMock as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Profile')).toBeDefined();
  });
  fireEvent.press(getByText('Profile'));

  expect(innerNavigateMock).toHaveBeenCalledWith('SettingsScreens', {
    screen: 'Settings/Profile',
  });
});

test('navigates to account selection', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={navigationMock as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Account Name')).toBeDefined();
  });
  fireEvent.press(getByText('Account Name'));

  expect(innerNavigateMock).toHaveBeenCalledWith('SettingsScreens', {
    screen: 'Settings/AccountSelection',
  });
});

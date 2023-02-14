import React from 'react';
import SettingsScreen from './SettingsScreen';
import { render, waitFor } from '@testing-library/react-native';
import DeviceInfo from 'react-native-device-info';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useUserProfile } from '../hooks/useUserProfile';

jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

jest.mock('../hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useUserProfileMock = useUserProfile as jest.Mock;
const getVersionMock = DeviceInfo.getVersion as jest.Mock;

beforeEach(() => {
  getVersionMock.mockReturnValue('1.0');
  useActiveAccountMock.mockReturnValue({
    account: { name: 'Account Name' },
  });
  useUserProfileMock.mockReturnValue({
    data: { profile: { displayName: 'User Name' } },
  });
});

test('shows logout button and version', async () => {
  const { getByTestId } = await render(<SettingsScreen />);

  await waitFor(() => {
    expect(getByTestId('oauth-logout-button')).toBeDefined();
    expect(getByTestId('version-text')).toBeDefined();
  });
});

test('shows account name', async () => {
  const { getByText } = await render(<SettingsScreen />);

  await waitFor(() => {
    expect(getByText('Account Name')).toBeDefined();
  });
});

test('(temporarily) shows user displayName', async () => {
  const { getByText } = await render(<SettingsScreen />);

  await waitFor(() => {
    expect(getByText('User Name')).toBeDefined();
  });
});

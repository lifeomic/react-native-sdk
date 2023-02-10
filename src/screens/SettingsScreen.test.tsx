import React from 'react';
import SettingsScreen from './SettingsScreen';
import { render, waitFor } from '@testing-library/react-native';
import DeviceInfo from 'react-native-device-info';

const getVersionMock = DeviceInfo.getVersion as jest.Mock;

beforeEach(() => {
  getVersionMock.mockReturnValue('1.0');
});

test('shows logout button', async () => {
  const { getByTestId } = await render(<SettingsScreen />);

  await waitFor(() => {
    expect(getByTestId('oauth-logout-button')).toBeDefined();
    expect(getByTestId('version-text')).toBeDefined();
  });
});

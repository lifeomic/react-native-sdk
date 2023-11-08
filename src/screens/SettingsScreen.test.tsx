import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { useWearables } from '../hooks/useWearables';
import { SettingsScreen } from './SettingsScreen';
import { openURL } from '../common/urls';
import { useAppConfig } from '../hooks/useAppConfig';

jest.mock('../hooks/useWearables', () => ({
  useWearables: jest.fn(),
}));
jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));
jest.mock('../common/urls', () => ({
  openURL: jest.fn(),
}));

const useWearablesMock = useWearables as jest.Mock;
const useNavigationMock = useNavigation as jest.Mock;
const getVersionMock = DeviceInfo.getVersion as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;
const openURLMock = openURL as jest.Mock;

const navigateMock = jest.fn();

beforeEach(() => {
  getVersionMock.mockReturnValue('1.0');
  useWearablesMock.mockReturnValue({
    useWearableIntegrationsQuery: jest.fn().mockReturnValue({
      data: undefined,
    }),
  });
  useNavigationMock.mockReturnValue({
    navigate: navigateMock,
  });
  useAppConfigMock.mockReturnValue({
    data: {
      support: {
        url: 'http://unit-test/support',
      },
    },
  });
});

test('shows logout button and version', async () => {
  const { getByTestId } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByTestId('oauth-logout-button')).toBeDefined();
    expect(getByTestId('version-text')).toBeDefined();
  });
});

test('navigates to user profile', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Profile')).toBeDefined();
  });
  fireEvent.press(getByText('Profile'));

  expect(navigateMock).toHaveBeenCalledWith('Settings/Profile');
});

test('opens the support link', async () => {
  const { getByText } = await render(
    <SettingsScreen navigation={useNavigation() as any} route={{} as any} />,
  );

  await waitFor(() => {
    expect(getByText('Support')).toBeDefined();
  });
  fireEvent.press(getByText('Support'));

  expect(openURLMock).toHaveBeenCalledWith('http://unit-test/support');
});

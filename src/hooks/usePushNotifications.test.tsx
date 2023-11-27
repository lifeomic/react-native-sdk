import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpClientContextProvider } from './useHttpClient';
import { PushNotificationsProvider } from './usePushNotifications';
import { Platform, Text } from 'react-native';
import { PushNotificationsConfig } from '../common/DeveloperConfig';
import * as NotificationsUtils from '../common/Notifications';
import { Notifications } from 'react-native-notifications';
import { ActiveAccountProvider } from './useActiveAccount';

jest.mock('react-native-notifications', () => ({
  Notifications: {
    setNotificationChannel: jest.fn(),
  },
}));

const renderProvider = (config?: PushNotificationsConfig) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <HttpClientContextProvider>
        <ActiveAccountProvider account="test-account">
          <PushNotificationsProvider config={config}>
            <Text>content</Text>
          </PushNotificationsProvider>
        </ActiveAccountProvider>
      </HttpClientContextProvider>
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.spyOn(Notifications, 'setNotificationChannel').mockReturnValue();
  jest
    .spyOn(NotificationsUtils, 'requestNotificationsPermissions')
    .mockReturnValue();
  jest.spyOn(NotificationsUtils, 'registerDeviceToken').mockReturnValue();

  Platform.OS = 'ios';
});

test('requests permissions', async () => {
  renderProvider({
    enabled: true,
    applicationName: 'test-app',
    channelId: 'test-channel',
    description: 'test-description',
  });

  await waitFor(() => {
    expect(
      NotificationsUtils.requestNotificationsPermissions,
    ).toHaveBeenCalledTimes(1);
  });

  const callback = jest.mocked(
    NotificationsUtils.requestNotificationsPermissions,
  ).mock.calls[0][0];

  act(() => {
    callback({ deviceToken: 'test-token' });
  });

  expect(NotificationsUtils.registerDeviceToken).toHaveBeenCalledTimes(1);
  expect(NotificationsUtils.registerDeviceToken).toHaveBeenCalledWith({
    deviceToken: 'test-token',
    application: 'test-app',
    accountId: 'test-account',
    httpClient: expect.anything(),
  });
});

test('on Android, sets channel', async () => {
  Platform.OS = 'android';
  renderProvider({
    enabled: true,
    applicationName: 'test-app',
    channelId: 'test-channel',
    description: 'test-description',
  });

  await waitFor(() => {
    expect(Notifications.setNotificationChannel).toHaveBeenCalledTimes(1);
    expect(Notifications.setNotificationChannel).toHaveBeenCalledWith(
      expect.objectContaining({
        channelId: 'test-channel',
        name: 'test-app',
      }),
    );
  });
});

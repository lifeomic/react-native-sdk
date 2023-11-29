import React, { createContext, useContext, useEffect } from 'react';
import {
  registerDeviceToken,
  requestNotificationsPermissions,
} from '../../src/common/Notifications';
import { PushNotificationsConfig } from '../../src/common/DeveloperConfig';
import { Platform } from 'react-native';
import { Notifications } from 'react-native-notifications';
import { useHttpClient } from './useHttpClient';

export const PushNotificationsContext = createContext<{}>({});

export function PushNotificationsProvider({
  config,
  children,
}: {
  config?: PushNotificationsConfig;
  children: React.ReactNode;
}) {
  const { httpClient } = useHttpClient();

  const enabled = config?.applicationName && config?.enabled;

  // Set the notification channel for Android
  useEffect(() => {
    if (enabled) {
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannel({
          channelId: config.channelId,
          name: config.applicationName,
          importance: 5,
          description: config.description,
          enableLights: true,
          enableVibration: true,
          showBadge: true,
          vibrationPattern: [200, 1000, 500, 1000, 500],
        });
      }
    }
  }, [config, enabled]);

  useEffect(() => {
    if (enabled) {
      requestNotificationsPermissions(({ deviceToken }) => {
        if (deviceToken) {
          // Register the device with the LifeOmic platform to start receiving push notifications
          registerDeviceToken({
            deviceToken,
            application: config.applicationName,
            httpClient,
          });
        }
      });
    }
  }, [httpClient, config, enabled]);

  return (
    <PushNotificationsContext.Provider value={{}}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

export const usePushNotificationsClient = () =>
  useContext(PushNotificationsContext);

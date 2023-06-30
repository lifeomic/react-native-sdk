import React, { createContext, useContext, useEffect } from 'react';
import {
  PushNotificationsConfig,
  registerDeviceToken,
  requestNotificationsPermissions,
  safelyImportReactNativeNotifications,
} from '../../src/common';
import { Platform } from 'react-native';
import { useHttpClient } from './useHttpClient';
import { useActiveAccount } from './useActiveAccount';

export const PushNotificationsContext = createContext<{}>({});

export function PushNotificationsProvider({
  config,
  children,
}: {
  config?: PushNotificationsConfig;
  children: React.ReactNode;
}) {
  const { httpClient } = useHttpClient();
  const { account } = useActiveAccount();

  const enabled = config?.applicationName && config?.enabled;

  // Set the notification channel for Android
  useEffect(() => {
    if (enabled) {
      const setNotificationChannelAsync = async () => {
        const { rnnotifications } =
          await safelyImportReactNativeNotifications();

        if (Platform.OS === 'android' && rnnotifications) {
          rnnotifications.Notifications.setNotificationChannel({
            channelId: config?.channelId,
            name: config?.applicationName,
            importance: 5,
            description: config?.description,
            enableLights: true,
            enableVibration: true,
            showBadge: true,
            vibrationPattern: [200, 1000, 500, 1000, 500],
          });
        }
      };
      setNotificationChannelAsync();
    }
  }, [config, enabled]);

  useEffect(() => {
    if (enabled) {
      requestNotificationsPermissions(({ deviceToken }) => {
        if (deviceToken && account && config) {
          // Register the device with the LifeOmic platform to start receiving push notifications
          registerDeviceToken({
            deviceToken,
            application: config.applicationName,
            httpClient,
            accountId: account.id,
          });
        }
      });
    }
  }, [account, httpClient, config, enabled]);

  return (
    <PushNotificationsContext.Provider value={{}}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

export const usePushNotificationsClient = () =>
  useContext(PushNotificationsContext);

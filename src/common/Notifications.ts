import { AxiosInstance } from 'axios';
import { Platform, PermissionsAndroid } from 'react-native';
import {
  Notifications,
  Registered,
  Notification,
  NotificationCompletion,
  RegistrationError,
  NotificationBackgroundFetchResult,
} from 'react-native-notifications';

export const registerDeviceToken = ({
  deviceToken,
  application,
  httpClient,
}: {
  deviceToken: string;
  application: string;
  httpClient: AxiosInstance;
}) => {
  const provider = Platform.OS === 'ios' ? 'APNS' : 'GCM';
  const params = {
    provider,
    deviceToken,
    application,
  };
  httpClient.post('/v1/device-endpoints', params);
};

export const getInitialNotification = () => {
  return Notifications.getInitialNotification();
};

export const isRegisteredForNotifications = () => {
  return Notifications.isRegisteredForRemoteNotifications();
};

export const requestNotificationsPermissions = (
  callback: ({
    deviceToken,
    denied,
    error,
  }: {
    deviceToken?: string;
    denied?: boolean;
    error?: RegistrationError;
  }) => void,
) => {
  // Starting Android 13 (ie SDK 33), the POST_NOTIFICATIONS permission is required
  if (Platform.OS === 'android' && Platform.constants.Version >= 33) {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ).then((permissionStatus) => {
      if (permissionStatus === 'granted') {
        Notifications.registerRemoteNotifications();
      } else {
        callback({ denied: true });
        return;
      }
    });
  } else {
    Notifications.registerRemoteNotifications();
  }

  Notifications.events().registerRemoteNotificationsRegistered(
    (event: Registered) => {
      callback({ deviceToken: event.deviceToken, denied: false });
    },
  );

  Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
    callback({ denied: true });
  });

  Notifications.events().registerRemoteNotificationsRegistrationFailed(
    (registrationError: RegistrationError) => {
      callback({
        denied: false,
        error: registrationError,
      });
    },
  );
};

export const onNotificationReceived = (
  callback: (notification: Notification) => void,
) => {
  Notifications.events().registerNotificationReceivedForeground(
    (
      foregroundNotification: Notification,
      completion: (response: NotificationCompletion) => void,
    ) => {
      callback(foregroundNotification);
      completion({ alert: true, badge: false, sound: false });
    },
  );

  Notifications.events().registerNotificationReceivedBackground(
    (
      backgroundNotification: Notification,
      completion: (response: NotificationBackgroundFetchResult) => void,
    ) => {
      callback(backgroundNotification);
      completion(NotificationBackgroundFetchResult.NEW_DATA);
    },
  );
};

export const onNotificationOpened = (
  callback: (notification: Notification) => void,
) => {
  Notifications.events().registerNotificationOpened(
    (
      openedNotification: Notification,
      completion: (response: NotificationCompletion) => void,
    ) => {
      callback(openedNotification);
      completion({ alert: true, badge: false, sound: false });
    },
  );
};

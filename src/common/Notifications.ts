import { AxiosInstance } from 'axios';
import { Platform, PermissionsAndroid } from 'react-native';
import { useDeveloperConfig } from '../hooks';

// React native notifications automatically initializes Firebase which
// causes Android app crashes if the user has not registered their app
// with Firebase services. This function adds safety to not import
// the dependency unintentionally still allows all
// react-native-notifications code to exist.
export const safelyImportReactNativeNotifications = () => {
  const { pushNotificationsConfig } = useDeveloperConfig();
  let rnnotifications: any; // we cant cast to the actual NotificationsRoot at this time due to dynamic imported dependency
  if (
    pushNotificationsConfig?.enabled &&
    pushNotificationsConfig?.applicationName
  ) {
    try {
      rnnotifications = require('react-native-notifications');
      return rnnotifications;
    } catch (error) {
      console.error(
        'Error: Failed to import react-native-notifications, ',
        error,
      );
      return undefined;
    }
  }
  return undefined;
};

export const registerDeviceToken = ({
  deviceToken,
  application,
  httpClient,
  accountId,
}: {
  deviceToken: string;
  application: string;
  httpClient: AxiosInstance;
  accountId: string;
}) => {
  const provider = Platform.OS === 'ios' ? 'APNS' : 'GCM';
  const params = {
    provider,
    deviceToken,
    application,
  };
  const options = {
    headers: {
      'LifeOmic-Account': accountId,
    },
  };
  httpClient.post('/v1/device-endpoints', params, options);
};

export const getInitialNotification = () => {
  const { rnnotifications } = safelyImportReactNativeNotifications();
  return rnnotifications.Notifcations.getInitialNotification();
};

export const isRegisteredForNotifications = () => {
  const { rnnotifications } = safelyImportReactNativeNotifications();
  return rnnotifications.Notifications.isRegisteredForRemoteNotifications();
};

export const requestNotificationsPermissions = (
  callback: ({
    deviceToken,
    denied,
    error,
  }: {
    deviceToken?: string;
    denied?: boolean;
    // error?: RegistrationError;
    error?: any;
  }) => void,
) => {
  const { rnnotifications } = safelyImportReactNativeNotifications();

  // Starting Android 13 (ie SDK 33), the POST_NOTIFICATIONS permission is required
  if (Platform.OS === 'android' && Platform.constants.Version >= 33) {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ).then((permissionStatus) => {
      if (permissionStatus === 'granted') {
        rnnotifications.Notifications.registerRemoteNotifications();
      } else {
        callback({ denied: true });
        return;
      }
    });
  } else {
    rnnotifications.Notifications.registerRemoteNotifications();
  }

  rnnotifications.Notifications.events().registerRemoteNotificationsRegistered(
    // (event: Registered) => {
    (event: any) => {
      callback({ deviceToken: event.deviceToken, denied: false });
    },
  );

  rnnotifications.Notifications.events().registerRemoteNotificationsRegistrationDenied(
    () => {
      callback({ denied: true });
    },
  );

  rnnotifications.Notifications.events().registerRemoteNotificationsRegistrationFailed(
    // (registrationError: RegistrationError) => {
    (registrationError: any) => {
      callback({
        denied: false,
        error: registrationError,
      });
    },
  );
};

export const onNotificationReceived = (
  //   callback: (notification: Notification) => void,
  callback: (notification: any) => void,
) => {
  const { rnnotifications } = safelyImportReactNativeNotifications();
  rnnotifications.Notifications.events().registerNotificationReceivedForeground(
    (
      //   foregroundNotification: Notification,
      foregroundNotification: any,
      //   completion: (response: NotificationCompletion) => void,
      completion: (response: any) => void,
    ) => {
      callback(foregroundNotification);
      completion({ alert: true, badge: false, sound: false });
    },
  );

  rnnotifications.Notifications.events().registerNotificationReceivedBackground(
    (
      //   backgroundNotification: Notification,
      backgroundNotification: any,
      //   completion: (response: NotificationBackgroundFetchResult) => void,
      completion: (response: any) => void,
    ) => {
      callback(backgroundNotification);
      completion(rnnotifications.NotificationBackgroundFetchResult.NEW_DATA);
    },
  );
};

export const onNotificationOpened = (
  //   callback: (notification: Notification) => void,
  callback: (notification: any) => void,
) => {
  const { rnnotifications } = safelyImportReactNativeNotifications();
  rnnotifications.Notifications.events().registerNotificationOpened(
    (
      //   openedNotification: Notification,
      openedNotification: any,
      //   completion: (response: NotificationCompletion) => void,
      completion: (response: any) => void,
    ) => {
      callback(openedNotification);
      completion({ alert: true, badge: false, sound: false });
    },
  );
};

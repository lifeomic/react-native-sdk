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
  if (pushNotificationsConfig?.enabled) {
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

const { rnnotifications } = safelyImportReactNativeNotifications();

export const getInitialNotification = () => {
  return rnnotifications.Notifcations.getInitialNotification();
};

export const isRegisteredForNotifications = () => {
  const { pushNotificationsConfig } = useDeveloperConfig();
  let NotificationsModule: any;
  if (pushNotificationsConfig?.enabled) {
    try {
      NotificationsModule = require('react-native-notifications');
    } catch (error) {
      console.log('error: ', error);
    }
  }
  if (pushNotificationsConfig?.enabled) {
    return NotificationsModule.Notifications.isRegisteredForRemoteNotifications();
  }
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
  const { pushNotificationsConfig } = useDeveloperConfig();
  let NotificationsModule: any;
  if (pushNotificationsConfig?.enabled) {
    try {
      NotificationsModule = require('react-native-notifications');
    } catch (error) {
      console.log(
        'Error: Failed to import react-native-notifications, ',
        error,
      );
    }
  }

  if (pushNotificationsConfig?.enabled) {
    // Starting Android 13 (ie SDK 33), the POST_NOTIFICATIONS permission is required
    if (Platform.OS === 'android' && Platform.constants.Version >= 33) {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ).then((permissionStatus) => {
        if (permissionStatus === 'granted') {
          NotificationsModule.Notifications.registerRemoteNotifications();
        } else {
          callback({ denied: true });
          return;
        }
      });
    } else {
      if (pushNotificationsConfig?.enabled) {
        NotificationsModule.Notifications.registerRemoteNotifications();
      }
    }

    if (pushNotificationsConfig?.enabled) {
      NotificationsModule.Notifications.events().registerRemoteNotificationsRegistered(
        // (event: Registered) => {
        (event: any) => {
          callback({ deviceToken: event.deviceToken, denied: false });
        },
      );

      NotificationsModule.Notifications.events().registerRemoteNotificationsRegistrationDenied(
        () => {
          callback({ denied: true });
        },
      );

      NotificationsModule.Notifications.events().registerRemoteNotificationsRegistrationFailed(
        // (registrationError: RegistrationError) => {
        (registrationError: any) => {
          callback({
            denied: false,
            error: registrationError,
          });
        },
      );
    }
  }
};

export const onNotificationReceived = (
  callback: (notification: Notification) => void,
) => {
  const { pushNotificationsConfig } = useDeveloperConfig();
  let NotificationsModule: any;
  if (pushNotificationsConfig?.enabled) {
    try {
      NotificationsModule = require('react-native-notifications');
    } catch (error) {
      console.log('error: ', error);
    }
  }
  if (pushNotificationsConfig?.enabled) {
    NotificationsModule.Notifications.events().registerNotificationReceivedForeground(
      (
        foregroundNotification: Notification,
        //   completion: (response: NotificationCompletion) => void,
        completion: (response: any) => void,
      ) => {
        callback(foregroundNotification);
        completion({ alert: true, badge: false, sound: false });
      },
    );

    NotificationsModule.Notifications.events().registerNotificationReceivedBackground(
      (
        backgroundNotification: Notification,
        //   completion: (response: NotificationBackgroundFetchResult) => void,
        completion: (response: any) => void,
      ) => {
        callback(backgroundNotification);
        completion(
          NotificationsModule.NotificationBackgroundFetchResult.NEW_DATA,
        );
      },
    );
  }
};

export const onNotificationOpened = (
  callback: (notification: Notification) => void,
) => {
  const { pushNotificationsConfig } = useDeveloperConfig();
  let NotificationsModule: any;
  if (pushNotificationsConfig?.enabled) {
    try {
      NotificationsModule = require('react-native-notifications');
    } catch (error) {
      console.log('error: ', error);
    }
  }
  if (pushNotificationsConfig?.enabled) {
    NotificationsModule.Notifications.events().registerNotificationOpened(
      (
        openedNotification: Notification,
        //   completion: (response: NotificationCompletion) => void,
        completion: (response: any) => void,
      ) => {
        callback(openedNotification);
        completion({ alert: true, badge: false, sound: false });
      },
    );
  }
};

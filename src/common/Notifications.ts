import { AxiosInstance } from 'axios';
import { Platform, PermissionsAndroid } from 'react-native';
import { PushNotificationsConfig } from './DeveloperConfig';

// React native notifications automatically initializes Firebase which
// causes Android app crashes if the user has not registered their app
// with Firebase services. This function adds safety to not import
// the dependency unintentionally and still allows all
// react-native-notifications code to exist.
export const safelyImportReactNativeNotifications = async (
  pushNotificationsConfig: PushNotificationsConfig | undefined,
) => {
  // const { pushNotificationsConfig } = useDeveloperConfig();
  // we cant cast to the actual NotificationsRoot at this time due to dynamic imported dependency.
  // this is true for types used below as well.
  let rnnotifications: any;
  if (pushNotificationsConfig?.enabled) {
    const modulePath = 'react-native-notifications';
    if (pushNotificationsConfig.applicationName !== 'example') {
      const resolvePath = require.resolve(modulePath);
      rnnotifications = await import(resolvePath);
    } else {
      rnnotifications = await import(modulePath);
    }
    return rnnotifications;
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

export const getInitialNotification = async (
  pushNotificationsConfig: PushNotificationsConfig | undefined,
) => {
  const { rnnotifications } = await safelyImportReactNativeNotifications(
    pushNotificationsConfig,
  );
  return rnnotifications.Notifcations.getInitialNotification();
};

export const isRegisteredForNotifications = async (
  pushNotificationsConfig: PushNotificationsConfig | undefined,
) => {
  const { rnnotifications } = await safelyImportReactNativeNotifications(
    pushNotificationsConfig,
  );
  return rnnotifications.Notifications.isRegisteredForRemoteNotifications();
};

export const requestNotificationsPermissions = async (
  pushNotificationsConfig: PushNotificationsConfig | undefined,
  callback: ({
    deviceToken,
    denied,
    error,
  }: {
    deviceToken?: string;
    denied?: boolean;
    error?: any;
  }) => void,
) => {
  const { rnnotifications } = await safelyImportReactNativeNotifications(
    pushNotificationsConfig,
  );

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
    (registrationError: any) => {
      callback({
        denied: false,
        error: registrationError,
      });
    },
  );
};

export const onNotificationReceived = async (
  pushNotificationsConfig: PushNotificationsConfig | undefined,
  callback: (notification: any) => void,
) => {
  const { rnnotifications } = await safelyImportReactNativeNotifications(
    pushNotificationsConfig,
  );
  if (rnnotifications) {
    rnnotifications.Notifications.events().registerNotificationReceivedForeground(
      (foregroundNotification: any, completion: (response: any) => void) => {
        callback(foregroundNotification);
        completion({ alert: true, badge: false, sound: false });
      },
    );

    rnnotifications.Notifications.events().registerNotificationReceivedBackground(
      (backgroundNotification: any, completion: (response: any) => void) => {
        callback(backgroundNotification);
        completion(rnnotifications.NotificationBackgroundFetchResult.NEW_DATA);
      },
    );
  }
};

export const onNotificationOpened = async (
  pushNotificationsConfig: PushNotificationsConfig | undefined,
  callback: (notification: any) => void,
) => {
  const { rnnotifications } = await safelyImportReactNativeNotifications(
    pushNotificationsConfig,
  );
  if (rnnotifications) {
    await rnnotifications.Notifications.events().registerNotificationOpened(
      (openedNotification: any, completion: (response: any) => void) => {
        callback(openedNotification);
        completion({ alert: true, badge: false, sound: false });
      },
    );
  }
};

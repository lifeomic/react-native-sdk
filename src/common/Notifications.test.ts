import {
  getInitialNotification,
  isRegisteredForNotifications,
  requestNotificationsPermissions,
  onNotificationReceived,
  onNotificationOpened,
} from './Notifications';
import {
  Notifications,
  NotificationBackgroundFetchResult,
} from 'react-native-notifications';

let registerRemoteNotificationsRegistered = jest.fn();
let registerRemoteNotificationsRegistrationDenied = jest.fn();
let registerRemoteNotificationsRegistrationFailed = jest.fn();

const events = {
  registerRemoteNotificationsRegistered,
  registerRemoteNotificationsRegistrationDenied,
  registerRemoteNotificationsRegistrationFailed,
};

jest.mock('react-native-notifications', () => ({
  Notifications: {
    getInitialNotification: jest.fn(),
    isRegisteredForRemoteNotifications: jest.fn(),
    registerRemoteNotifications: jest.fn(),
    events: jest.fn(() => events),
  },
  NotificationBackgroundFetchResult: { NEW_DATA: 'NEW_DATA' },
}));

const mockNotification = {
  identifier: '1',
  payload: {},
  body: 'Test notification',
  silent: 0,
  sound: 'chime.aiff',
  thread: '',
  title: 'Local Notification Title',
  badge: 1,
  type: 'notification',
};

test('getInitialNotification: returns the initial notification', async () => {
  Notifications.getInitialNotification = jest
    .fn()
    .mockResolvedValue(mockNotification);
  const result = await getInitialNotification();
  expect(result).toStrictEqual(mockNotification);
});

test('isRegisteredForRemoteNotifications: returns if the device is registered for notifications', async () => {
  Notifications.isRegisteredForRemoteNotifications = jest
    .fn()
    .mockResolvedValue(true);
  const result = await isRegisteredForNotifications();
  expect(result).toStrictEqual(true);
});

describe('requestNotificationsPermissions', () => {
  it('should call the callback with deviceToken when registered successfully', () => {
    const callback = jest.fn();
    const deviceToken = 'a-device-token';
    const event = { deviceToken };
    Notifications.registerRemoteNotifications = jest.fn();
    Notifications.events().registerRemoteNotificationsRegistered = jest
      .fn()
      .mockImplementationOnce((cb) => cb(event));
    requestNotificationsPermissions(callback);
    expect(Notifications.registerRemoteNotifications).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({ deviceToken, denied: false });
  });

  it('should call the callback with denied true when registration is denied', () => {
    const callback = jest.fn();
    Notifications.events().registerRemoteNotificationsRegistrationDenied = jest
      .fn()
      .mockImplementationOnce((cb) => cb());
    requestNotificationsPermissions(callback);
    expect(callback).toHaveBeenCalledWith({ denied: true });
  });

  it('should call the callback with error when registration failed', () => {
    const callback = jest.fn();
    const error = {
      code: 'registration-failed',
      message: 'Failed to register for push notifications.',
    };
    Notifications.events().registerRemoteNotificationsRegistrationFailed = jest
      .fn()
      .mockImplementationOnce((cb) => cb(error));
    requestNotificationsPermissions(callback);
    expect(callback).toHaveBeenCalledWith({ denied: false, error });
  });
});

describe('onNotificationReceived', () => {
  it('should call the callback and completion with foreground notification', () => {
    const callback = jest.fn();
    const completion = jest.fn();
    Notifications.events().registerNotificationReceivedForeground = jest
      .fn()
      .mockImplementationOnce((cb) => cb(mockNotification, completion));
    Notifications.events().registerNotificationReceivedBackground = jest.fn();
    onNotificationReceived(callback);
    expect(callback).toHaveBeenCalledWith(mockNotification);
    expect(completion).toHaveBeenCalledWith({
      alert: true,
      badge: false,
      sound: false,
    });
  });

  it('should call the callback and completion with background notification', () => {
    const callback = jest.fn();
    const completion = jest.fn();
    Notifications.events().registerNotificationReceivedForeground = jest.fn();
    Notifications.events().registerNotificationReceivedBackground = jest
      .fn()
      .mockImplementationOnce((cb) => cb(mockNotification, completion));
    onNotificationReceived(callback);
    expect(callback).toHaveBeenCalledWith(mockNotification);
    expect(completion).toHaveBeenCalledWith(
      NotificationBackgroundFetchResult.NEW_DATA,
    );
  });

  describe('onNotificationOpened', () => {
    test('should call the callback with the notification', () => {
      const callback = jest.fn();
      const completion = jest.fn();
      Notifications.events().registerNotificationOpened = jest
        .fn()
        .mockImplementationOnce((cb) => cb(mockNotification, completion));
      onNotificationOpened(callback);
      expect(callback).toHaveBeenCalledWith(mockNotification);
      expect(completion).toHaveBeenCalledWith({
        alert: true,
        badge: false,
        sound: false,
      });
    });
  });
});
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import {
  getInitialNotification,
  onNotificationOpened,
  onNotificationReceived,
} from '../../src/common';
import { Platform } from 'react-native';
import { Notifications } from 'react-native-notifications';

type PushNotificationsEventType = 'notificationReceived' | 'notificationOpened';

export type PushNotificationsEvent = {
  type: PushNotificationsEventType;
  notification: Notification;
};

interface PushNotificationsStateType {
  events: PushNotificationsEvent[];
  setEvents: Dispatch<SetStateAction<PushNotificationsEvent[]>>;
}

export const PushNotificationsContext =
  createContext<PushNotificationsStateType>({
    events: [],
    setEvents: () => [],
  });

export function PushNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pushNotificationEvents, setPushNotificationEvents] = useState<
    PushNotificationsEvent[]
  >([]);

  useEffect(() => {
    // Handler called when a notification is pressed
    onNotificationOpened((notification) => {
      setPushNotificationEvents(
        (events) =>
          [
            { type: 'notificationOpened', notification },
            ...events,
          ] as PushNotificationsEvent[],
      );
    });

    onNotificationReceived((notification) => {
      setPushNotificationEvents(
        (events) =>
          [
            { type: 'notificationReceived', notification },
            ...events,
          ] as PushNotificationsEvent[],
      );
    });

    const getInitial = async () => {
      // Get the notification that opened the application
      const notification = await getInitialNotification();
      if (notification) {
        setPushNotificationEvents(
          (events) =>
            [
              { type: 'notificationOpened', notification },
              ...events,
            ] as PushNotificationsEvent[],
        );
      }
    };

    getInitial();
  }, []);

  // Set the notification channel for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannel({
        channelId: 'sdk-example-channel',
        name: 'SDK Example',
        importance: 5,
        description: 'Channel for the SDK',
        enableLights: true,
        enableVibration: true,
        showBadge: true,
        vibrationPattern: [200, 1000, 500, 1000, 500],
      });
    }
  }, []);

  const value: PushNotificationsStateType = {
    events: pushNotificationEvents,
    setEvents: setPushNotificationEvents,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

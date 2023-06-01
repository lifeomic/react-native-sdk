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

type PushNotificationEventType = 'notificationReceived' | 'notificationOpened';

export type PushNotificationEvent = {
  type: PushNotificationEventType;
  notification: Notification;
};

interface PushNotificationsStateType {
  events: PushNotificationEvent[];
  setEvents: Dispatch<SetStateAction<PushNotificationEvent[]>>;
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
    PushNotificationEvent[]
  >([]);

  useEffect(() => {
    // Handler called when a notification is pressed
    onNotificationOpened((notification) => {
      setPushNotificationEvents(
        (events) =>
          [
            { type: 'notificationOpened', notification },
            ...events,
          ] as PushNotificationEvent[],
      );
    });

    onNotificationReceived((notification) => {
      setPushNotificationEvents(
        (events) =>
          [
            { type: 'notificationReceived', notification },
            ...events,
          ] as PushNotificationEvent[],
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
            ] as PushNotificationEvent[],
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

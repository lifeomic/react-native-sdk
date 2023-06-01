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

interface PushNotificationsStateType {
  events: Event | { type: string; notification: Notification }[];
  setEvents: Dispatch<
    SetStateAction<Event | { type: string; notification: Notification }[]>
  >;
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
  const [notificationEvents, setNotificationEvents] = useState<
    Event | { type: string; notification: Notification }[]
  >([]);

  useEffect(() => {
    // Handler called when a notification is pressed
    onNotificationOpened((notification) => {
      setNotificationEvents((events) => [
        { type: 'notificationOpened', notification },
        //@ts-ignore - typescript is complaining about Events (of type Event[]) not being an iterable object
        ...events,
      ]);
    });

    onNotificationReceived((notification) => {
      setNotificationEvents((events) => [
        { type: 'notificationReceived', notification },
        ...events,
      ]);
    });

    const getInitial = async () => {
      // Get the notification that opened the application
      const notification = await getInitialNotification();
      if (notification) {
        setNotificationEvents((events) => [
          { type: 'notificationOpened', notification },
          ...events,
        ]);
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
    events: notificationEvents,
    setEvents: setNotificationEvents,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

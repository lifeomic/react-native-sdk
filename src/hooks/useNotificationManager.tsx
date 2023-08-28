import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  PrivatePostNotification,
  useNotifications,
  Notification,
} from './useNotifications';
import { useAsyncStorage } from './useAsyncStorage';
import { onNotificationReceived } from '../common';
import { compact } from 'lodash';

export interface NotificationsManagerContextType {
  unreadCount: number | undefined;
  setNotificationsRead: () => void;
  /**
   * undefined - async storage has not been loaded yet
   * null - async storage has been loaded but no value
   * Date - async storage has loaded and key was set
   */
  lastReadAt: Date | null | undefined;
  privatePostsUserIds: string[] | undefined;
}

export const NotificationsManagerContext =
  createContext<NotificationsManagerContextType>({
    unreadCount: 0,
    privatePostsUserIds: [],
    setNotificationsRead: () => {},
    lastReadAt: null,
  });

export const NotificationsManagerProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [lastNotificationReadTime, setLastNotificationReadTime] =
    useAsyncStorage('lastNotificationReadTime');
  const { data, refetch } = useNotifications();

  /**
   * We need a ref here so we can have access to the current value inside the
   * closure created grabbing the last read time from async storage
   */
  const lastReadAtRef = useRef<NotificationsManagerContextType['lastReadAt']>();
  const [lastReadAt, setLastReadAt] =
    useState<NotificationsManagerContextType['lastReadAt']>();

  const updateLastReadAt = (readAt: Date | null) => {
    setLastReadAt(readAt);
    lastReadAtRef.current = readAt;
  };

  /**
   * Load persisted lastReadAt from async storage
   */
  useEffect(() => {
    if (lastNotificationReadTime.isFetchedAfterMount) {
      updateLastReadAt(
        lastNotificationReadTime.data
          ? new Date(lastNotificationReadTime.data)
          : null,
      );
    }
  }, [
    lastNotificationReadTime.data,
    lastNotificationReadTime.isFetchedAfterMount,
  ]);

  /**
   * Persist lastReadAt to async storage on background/close
   */
  useEffect(() => {
    const handleAppStateChange = (newState: AppStateStatus) => {
      if (newState === 'background' || newState === 'inactive') {
        lastReadAtRef.current &&
          setLastNotificationReadTime(lastReadAtRef.current.toISOString());
      }
      if (newState === 'active') {
        refetch();
      }
    };

    const listener = AppState.addEventListener('change', handleAppStateChange);

    return () => listener.remove();
  }, [refetch, setLastNotificationReadTime]);

  useEffect(() => {
    onNotificationReceived(() => {
      refetch();
    });
  }, [refetch]);

  const notifications =
    data?.notificationsForUser.edges.map((edge) => edge.node) ?? [];

  const setNotificationsRead = useCallback(() => {
    updateLastReadAt(new Date());
  }, []);

  let unreadCount: number | undefined;
  let privatePostsUserIds: string[] | undefined;

  const notificationsToAuthorId = (_notifications: Notification[]) =>
    compact(
      _notifications.map((n) => {
        if (n.__typename === 'PrivatePostNotification') {
          return (n as PrivatePostNotification).post.authorId;
        }
      }),
    );

  if (lastReadAt === null) {
    unreadCount = notifications.length;
    privatePostsUserIds = notificationsToAuthorId(notifications);
  } else if (lastReadAt instanceof Date) {
    const newNotifications = notifications?.filter(
      (notification) => new Date(notification.time) > lastReadAt,
    );
    unreadCount = newNotifications.length;
    privatePostsUserIds = notificationsToAuthorId(newNotifications);
  }

  return (
    <NotificationsManagerContext.Provider
      value={{
        unreadCount,
        privatePostsUserIds,
        setNotificationsRead,
        lastReadAt,
      }}
    >
      {children}
    </NotificationsManagerContext.Provider>
  );
};

export const useNotificationManager = () =>
  useContext(NotificationsManagerContext);

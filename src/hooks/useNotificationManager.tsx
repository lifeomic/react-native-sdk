import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { useNotifications, FeedNotification } from './useNotifications';
import { useAsyncStorage } from './useAsyncStorage';
import { onNotificationReceived } from '../common/Notifications';
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
    lastReadAt: undefined,
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

  const updateLastReadAt = useCallback((readAt: Date | null) => {
    setLastReadAt(readAt);
    lastReadAtRef.current = readAt;
  }, []);

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
    updateLastReadAt,
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

    const handleOnBlur = () => {
      lastReadAtRef.current &&
        setLastNotificationReadTime(lastReadAtRef.current.toISOString());
    };

    const listener = AppState.addEventListener('change', handleAppStateChange);

    // Android can be forced killed without triggering an AppState change
    // Luckily there is a blur event emitted
    if (Platform.OS === 'android') {
      const blurListener = AppState.addEventListener('blur', handleOnBlur);
      return () => {
        listener.remove();
        blurListener.remove();
      };
    }

    return () => {
      listener.remove();
    };
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
  }, [updateLastReadAt]);

  let unreadCount: number | undefined;
  let privatePostsUserIds: string[] | undefined;

  const notificationsToAuthorId = (_notifications: FeedNotification[]) =>
    compact(
      _notifications.map((n) => {
        if (n.__typename === 'PrivatePostNotification') {
          return n.post.authorId;
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

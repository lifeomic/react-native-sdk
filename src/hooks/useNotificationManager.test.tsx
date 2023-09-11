import React from 'react';
import {
  useNotificationManager,
  NotificationsManagerProvider,
} from './useNotificationManager';
import {
  FeedNotification,
  NotificationQueryResponse,
} from '../hooks/useNotifications';
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
} from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNotifications } from './useNotifications';
import { useAsyncStorage } from './useAsyncStorage';
import { uniqueId } from 'lodash';

let registerNotificationReceivedForeground = jest.fn();
let registerNotificationReceivedBackground = jest.fn();

const events = {
  registerNotificationReceivedForeground,
  registerNotificationReceivedBackground,
};

jest.mock('./useNotifications', () => ({
  useNotifications: jest.fn(),
}));
jest.mock('./useAsyncStorage', () => ({
  useAsyncStorage: jest.fn(),
}));

jest.mock('react-native-notifications', () => ({
  Notifications: {
    events: jest.fn(() => events),
  },
}));

const useNotificationsMock = useNotifications as jest.Mock;
const useAsyncStorageMock = useAsyncStorage as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useNotificationManager(), {
    wrapper: ({ children }) => (
      <NotificationsManagerProvider>{children}</NotificationsManagerProvider>
    ),
  });
};

const getNotificationEdge = (time: string = new Date().toISOString()) => {
  return {
    node: {
      __typename: 'CircleAdminPostNotification',
      id: uniqueId().toString(),
      time: time,
      fullText: 'Admin posted to your circle!',
      post: {
        id: 'id',
        authorId: 'someAuthor',
        circle: {
          id: '',
          isMember: true,
        },
      },
    } as FeedNotification,
  };
};

describe('NotificationsManager', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('refetch after notification arrived', async () => {
    useAsyncStorageMock.mockReturnValue([
      new Date('08/29/2023').toISOString(),
      jest.fn(),
      true,
    ]);

    const notificationResponse: NotificationQueryResponse = {
      notificationsForUser: {
        edges: [
          getNotificationEdge(),
          getNotificationEdge(new Date('08/28/2023').toISOString()),
        ],
      },
    };

    const refetchMock = jest.fn();
    useNotificationsMock.mockReturnValue({
      data: notificationResponse,
      refetch: refetchMock,
    });

    const { result } = await renderHookInContext();
    expect(result.current.unreadCount).toBe(1);

    expect(refetchMock).not.toHaveBeenCalled();
    registerNotificationReceivedForeground.mock.calls[0][0](
      {
        identifier: '',
        body: 'Someone sent you a message!',
        payload: {},
        title: '',
        sound: '',
        badge: 1,
        type: '',
        thread: '',
      },
      () => {
        expect(refetchMock).toHaveBeenCalled();
      },
    );
  });

  it('persists last read at time to async storage on background/inactive', async () => {
    const setLastNotificationReadTimeMock = jest.fn();
    useAsyncStorageMock.mockReturnValue([
      new Date('08/29/2023').toISOString(),
      setLastNotificationReadTimeMock,
      true,
    ]);

    let fireAppStateChange: (state: AppStateStatus) => void;
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, cb): NativeEventSubscription => {
        fireAppStateChange = cb;
        return {
          remove: jest.fn(),
        };
      });

    const notificationResponse: NotificationQueryResponse = {
      notificationsForUser: {
        edges: [],
      },
    };

    useNotificationsMock.mockReturnValue({
      data: notificationResponse,
    });

    renderHookInContext();
    await waitFor(() => expect(useAsyncStorageMock).toHaveBeenCalled());
    expect(setLastNotificationReadTimeMock).toHaveBeenCalledTimes(0);

    act(() => {
      fireAppStateChange('inactive');
    });

    await waitFor(() =>
      expect(setLastNotificationReadTimeMock).toHaveBeenCalledTimes(1),
    );

    act(() => {
      fireAppStateChange('inactive');
    });

    await waitFor(() =>
      expect(setLastNotificationReadTimeMock).toHaveBeenCalledTimes(2),
    );
  });
});

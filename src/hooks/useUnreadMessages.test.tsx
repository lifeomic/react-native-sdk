import React from 'react';
import {
  FeedNotification,
  NotificationQueryResponse,
  useNotifications,
} from './useNotifications';
import { act, renderHook } from '@testing-library/react-native';
import { useAsyncStorage } from './useAsyncStorage';
import {
  UnreadMessagesContextProvider,
  useUnreadMessages,
} from './useUnreadMessages';
import { uniqueId } from 'lodash';

jest.mock('./useAsyncStorage', () => ({
  useAsyncStorage: jest.fn(),
}));

jest.mock('./useNotifications', () => ({
  useNotifications: jest.fn(),
}));

const useAsyncStorageMock = useAsyncStorage as jest.Mock;
const useNotificationsMock = useNotifications as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useUnreadMessages(), {
    wrapper: ({ children }) => (
      <UnreadMessagesContextProvider>{children}</UnreadMessagesContextProvider>
    ),
  });
};

const getNotificationEdge = (time: string = new Date().toISOString()) => {
  return {
    node: {
      __typename: 'PrivatePostNotification',
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

  it('gets unread privatePosts from notifications', async () => {
    useNotificationsMock.mockReturnValue({
      data: {
        notificationsForUser: { edges: [getNotificationEdge()] },
      } as NotificationQueryResponse,
    });

    const setReadReceipts = jest.fn();
    useAsyncStorageMock.mockReturnValue([JSON.stringify([]), setReadReceipts]);

    const { result } = await renderHookInContext();

    expect(result.current.unreadIds).toEqual(['someAuthor']);
  });

  it('stored read receipts filter notifications and hook result', async () => {
    useNotificationsMock.mockReturnValue({
      data: {
        notificationsForUser: {
          edges: [getNotificationEdge(new Date('08/29/2023').toISOString())],
        },
      } as NotificationQueryResponse,
    });

    const setReadReceipts = jest.fn();
    useAsyncStorageMock.mockReturnValue([
      JSON.stringify([{ id: 'someAuthor', time: new Date().toISOString() }]),
      setReadReceipts,
    ]);

    const { result } = await renderHookInContext();
    expect(result.current.unreadIds).toEqual([]);
  });

  it('markMessage removes user from unreadIds and storage', async () => {
    useNotificationsMock.mockReturnValue({
      data: {
        notificationsForUser: {
          edges: [],
        },
      } as NotificationQueryResponse,
    });

    const setReadReceipts = jest.fn();
    useAsyncStorageMock.mockReturnValue([JSON.stringify([]), setReadReceipts]);

    const date = new Date();
    jest.useFakeTimers().setSystemTime(date);

    const { result } = await renderHookInContext();
    act(() => {
      result.current.markMessageRead?.('someUser');
    });

    expect(setReadReceipts).toHaveBeenCalledWith(
      JSON.stringify([{ id: 'someUser', time: date.toISOString() }]),
    );
  });
});

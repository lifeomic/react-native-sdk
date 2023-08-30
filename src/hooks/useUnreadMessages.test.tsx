import React from 'react';
import { useNotificationManager } from './useNotificationManager';
import { act, renderHook } from '@testing-library/react-native';
import { useAsyncStorage } from './useAsyncStorage';
import {
  UnreadMessagesContextProvider,
  useUnreadMessages,
} from './useUnreadMessages';

jest.mock('./useAsyncStorage', () => ({
  useAsyncStorage: jest.fn(),
}));

jest.mock('./useNotificationManager', () => ({
  useNotificationManager: jest.fn(),
}));

const useAsyncStorageMock = useAsyncStorage as jest.Mock;
const useNotificationManagerMock = useNotificationManager as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useUnreadMessages(), {
    wrapper: ({ children }) => (
      <UnreadMessagesContextProvider>{children}</UnreadMessagesContextProvider>
    ),
  });
};

describe('NotificationsManager', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('gets unread privatePosts from NotificationManager', async () => {
    useNotificationManagerMock.mockReturnValue({
      privatePostsUserIds: ['some_user'],
    });

    useAsyncStorageMock.mockReturnValue([
      {
        data: JSON.stringify([]),
        isFetchedAfterMount: true,
      },
      jest.fn(),
    ]);

    const { result } = await renderHookInContext();
    expect(result.current.unreadMessagesUserIds).toEqual(['some_user']);
  });

  it('fetches prior sessions unreadIds from storage', async () => {
    useNotificationManagerMock.mockReturnValue({
      privatePostsUserIds: [],
    });

    useAsyncStorageMock.mockReturnValue([
      {
        data: JSON.stringify(['some_user']),
        isFetchedAfterMount: true,
      },
      jest.fn(),
    ]);

    const { result } = await renderHookInContext();
    expect(result.current.unreadMessagesUserIds).toEqual(['some_user']);
  });

  it('markMessage removes user from unreadIds and storage', async () => {
    useNotificationManagerMock.mockReturnValue({
      privatePostsUserIds: [],
    });

    const setItemMock = jest.fn();
    useAsyncStorageMock.mockReturnValue([
      {
        data: JSON.stringify(['some_user', 'another_user']),
        isFetchedAfterMount: true,
      },
      setItemMock,
    ]);

    const { result } = await renderHookInContext();
    act(() => {
      result.current.markMessageRead?.('some_user');
    });

    expect(setItemMock).toHaveBeenCalledWith(JSON.stringify(['another_user']));
  });
});

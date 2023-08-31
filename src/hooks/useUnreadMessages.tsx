import React, { createContext, useContext, useEffect } from 'react';
import { uniq } from 'lodash';
import { useAsyncStorage } from './useAsyncStorage';
import { useNotificationManager } from './useNotificationManager';

type UnreadMessageContextProps = {
  unreadMessagesUserIds?: string[];
  markMessageRead?: (userId: string) => void;
};

const UnreadMessagesContext = createContext<UnreadMessageContextProps>({});

export const UnreadMessagesContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { unreadUserIds, addUserIds, removeUserId } = useUnreadUserIds();

  const { privatePostsUserIds: userIdsWithNewMessages } =
    useNotificationManager();

  useEffect(() => {
    if (userIdsWithNewMessages?.length) {
      addUserIds(userIdsWithNewMessages);
    }
  }, [addUserIds, unreadUserIds, userIdsWithNewMessages]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadMessagesUserIds: unreadUserIds,
        markMessageRead: removeUserId,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

const useUnreadUserIds = () => {
  const [unreadStoredUserIds, setUnreadStoredUserIds] = useAsyncStorage(
    'UnreadMessageUserIds',
  );

  const unreadUserIds = (
    unreadStoredUserIds.data ? JSON.parse(unreadStoredUserIds.data) : []
  ) as string[];

  const addUserIds = (userIds: string[]) => {
    const newUnreadUserIds = userIds.filter(
      (id) => !unreadUserIds.includes(id),
    );

    if (newUnreadUserIds.length) {
      setUnreadStoredUserIds(
        JSON.stringify(uniq([...unreadUserIds, ...newUnreadUserIds]).sort()),
      );
    }
  };

  const removeUserId = (userId: string) => {
    if (unreadUserIds.includes(userId)) {
      setUnreadStoredUserIds(
        JSON.stringify(unreadUserIds.filter((id) => id !== userId)),
      );
    }
  };

  return {
    unreadUserIds,
    addUserIds,
    removeUserId,
  };
};

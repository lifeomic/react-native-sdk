import React, { useState, createContext, useContext, useEffect } from 'react';
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
  const [initialUnreadMessages, setStoredUnreadMessages] = useAsyncStorage(
    'UnreadMessageUserIds',
  );
  const [unreadMessagesUserIds, setUnreadMessages] = useState<string[]>([]);
  const { privatePostsUserIds } = useNotificationManager();

  useEffect(() => {
    if (initialUnreadMessages.isFetchedAfterMount) {
      setUnreadMessages(
        initialUnreadMessages.data
          ? initialUnreadMessages.data?.split('#')
          : [],
      );
    }
  }, [initialUnreadMessages.data, initialUnreadMessages.isFetchedAfterMount]);

  useEffect(() => {
    const computeIds = (incomingUserIds: string[], unreadIds?: string[]) => {
      return unreadIds
        ? uniq([...unreadIds, ...incomingUserIds])
        : incomingUserIds;
    };

    if (privatePostsUserIds) {
      setUnreadMessages((currentUnreads) => {
        const newUserIds = computeIds(privatePostsUserIds, currentUnreads);
        setStoredUnreadMessages(newUserIds.join('#'));
        return newUserIds;
      });
    }
  }, [privatePostsUserIds, setStoredUnreadMessages]);

  const markMessageRead = (userId: string) => {
    if (unreadMessagesUserIds.includes(userId)) {
      setUnreadMessages((currentIds) =>
        currentIds?.filter((id) => id !== userId),
      );
    }
  };

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadMessagesUserIds: unreadMessagesUserIds ?? [],
        markMessageRead,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

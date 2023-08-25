import React, { useState, createContext, useContext, useEffect } from 'react';
import { onNotificationReceived } from '../common/Notifications';
import { uniq } from 'lodash';
import { useAsyncStorage } from './useAsyncStorage';

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

  useEffect(() => {
    if (initialUnreadMessages.isFetchedAfterMount) {
      setUnreadMessages(
        initialUnreadMessages.data
          ? initialUnreadMessages.data?.split('#')
          : [],
      );
    }
  }, [initialUnreadMessages.data, initialUnreadMessages.isFetchedAfterMount]);

  onNotificationReceived((notification) => {
    if (notification.payload.notificationType === 'privatePost') {
      const incomingUserId = `${notification?.payload?.authorId}`;
      const computeIds = (unreadIds?: string[]) => {
        return unreadIds
          ? uniq([...unreadIds, incomingUserId])
          : [incomingUserId];
      };
      setUnreadMessages((currentUnreads) => {
        const newUserIds = computeIds(currentUnreads);
        setStoredUnreadMessages(newUserIds.join('#'));
        return newUserIds;
      });
    }
  });

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

import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
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

  // Deserialize the userId array
  const getStoredUnreadIds = useCallback(() => {
    if (initialUnreadMessages.data) {
      return JSON.parse(initialUnreadMessages.data) as string[];
    } else {
      return [];
    }
  }, [initialUnreadMessages.data]);

  // Initial load from storage
  useEffect(() => {
    if (initialUnreadMessages.isFetchedAfterMount) {
      setUnreadMessages(getStoredUnreadIds());
    }
  }, [getStoredUnreadIds, initialUnreadMessages.isFetchedAfterMount]);

  // React to privatePostsUserIds changes and update state
  useEffect(() => {
    const computeIds = (incomingUserIds: string[], unreadIds?: string[]) => {
      return unreadIds
        ? uniq([...unreadIds, ...incomingUserIds])
        : incomingUserIds;
    };

    if (privatePostsUserIds) {
      setUnreadMessages((currentUnreads) => {
        return computeIds(privatePostsUserIds, currentUnreads);
      });
    }
  }, [privatePostsUserIds, setStoredUnreadMessages]);

  // React to state changes and update storage
  useEffect(() => {
    setStoredUnreadMessages(JSON.stringify(unreadMessagesUserIds));
  }, [setStoredUnreadMessages, unreadMessagesUserIds]);

  // Remove userIds from state
  const markMessageRead = useCallback(
    (userId: string) => {
      setUnreadMessages((currentIds) => {
        if (unreadMessagesUserIds.includes(userId)) {
          return currentIds?.filter((id) => id !== userId);
        }
        return currentIds;
      });
    },
    [unreadMessagesUserIds],
  );

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

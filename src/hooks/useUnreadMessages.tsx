import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { compact, find, orderBy, uniqBy } from 'lodash';
import { useAsyncStorage } from './useAsyncStorage';
import {
  NotificationQueryResponse,
  useNotifications,
} from './useNotifications';

type ReadReceipt = {
  id: string;
  time: string;
};

type UnreadMessageContextProps = {
  unreadIds?: string[];
  markMessageRead?: (userId: string) => void;
};

const UnreadMessagesContext = createContext<UnreadMessageContextProps>({});

export const UnreadMessagesContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { messageReadReceipts, updateReadReceiptForUser } =
    useMessageReadReceipts();
  const { data } = useNotifications();
  const unreadIds = useMemo(() => {
    return extractUnreadIdsFromNotifications(data, messageReadReceipts);
  }, [data, messageReadReceipts]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadIds,
        markMessageRead: updateReadReceiptForUser,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

const useMessageReadReceipts = () => {
  const [storedMessageReadReceipts, setMessageReadReceipts] = useAsyncStorage(
    'MessageReadReceipts',
  );

  const messageReadReceipts = useMemo(() => {
    return storedMessageReadReceipts.data
      ? (JSON.parse(storedMessageReadReceipts.data) as ReadReceipt[])
      : [];
  }, [storedMessageReadReceipts.data]);

  const updateReadReceiptForUser = useCallback(
    (userId: string) => {
      const updated = uniqBy(
        [
          {
            id: userId,
            time: new Date().toISOString(),
          },
          ...messageReadReceipts,
        ],
        'id',
      );
      setMessageReadReceipts(JSON.stringify(updated));
    },
    [messageReadReceipts, setMessageReadReceipts],
  );

  return {
    messageReadReceipts,
    updateReadReceiptForUser,
  };
};

const getAuthorIdTimeFromPrivatePosts = (
  notificationQueryData?: NotificationQueryResponse,
) =>
  // Filter by user, only need the newest message
  uniqBy(
    // Order by timestamp from newest to oldest
    orderBy(
      // Filter non-PrivatePosts
      compact(
        notificationQueryData?.notificationsForUser.edges.map(({ node }) => {
          if (node.__typename === 'PrivatePostNotification') {
            return { id: node.post.authorId, time: new Date(node.time) };
          }
        }),
      ),
      ({ time }) => time.getMilliseconds(),
      'desc',
    ),
    'id',
  );

const extractUnreadIdsFromNotifications = (
  notificationResponse: NotificationQueryResponse | undefined,
  readReceipts: ReadReceipt[],
) => {
  const unreadIds = getAuthorIdTimeFromPrivatePosts(notificationResponse).map(
    (userPost) => {
      const readReceipt = find(readReceipts, {
        id: userPost.id,
      });
      if (readReceipt) {
        return new Date(readReceipt.time) < userPost.time
          ? userPost.id
          : undefined;
      }
      return userPost.id;
    },
  );

  return compact(unreadIds);
};

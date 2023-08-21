import { useEffect, useState } from 'react';
import { usePollPageInfoForUsers } from './Circles/usePrivatePosts';
import { useAsyncStorage } from './useAsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isEqual } from 'lodash';

export const useDirectMessageEndCursor = (
  userId: string,
  recipientUserId: string,
) => {
  const [endCursor, setEndCursor] = useAsyncStorage(
    `${userId}-${recipientUserId}-endCursor`,
  );

  return { endCursor: endCursor?.data, setEndCursor };
};

type Props = {
  currentUserId?: string;
  userIds: string[];
};

const useGetLocalCursorsForUsers = ({ currentUserId, userIds }: Props) => {
  const [result, setResult] = useState<Map<string, string>>();
  useEffect(() => {
    async function fetchEndCursors() {
      const endCursorMap = new Map<string, string>();

      for await (const userId of userIds) {
        const endCursor = await AsyncStorage.getItem(
          `${currentUserId}-${userId}-endCursor`,
        );
        if (endCursor) {
          endCursorMap.set(userId, endCursor);
        }
      }
      if (!isEqual(result, endCursorMap)) {
        setResult(endCursorMap);
      }
    }
    fetchEndCursors();
  });

  return result;
};

const useGetRemoteCursorsForUsers = ({ userIds }: Props) => {
  const endCursorMap = new Map<string, string>();
  const userQueries = usePollPageInfoForUsers(userIds);

  if (userQueries.some((query) => query.isLoading)) {
    return { isLoading: true, endCursorMap };
  }

  userQueries.forEach((userQuery, index) => {
    const endCursor = userQuery.data?.privatePosts.pageInfo.endCursor;
    if (endCursor) {
      endCursorMap.set(userIds[index], endCursor);
    }
  });
  return { endCursorMap, isLoading: false };
};

export const useHasNewMessagesFromUsers = ({
  currentUserId,
  userIds,
}: Props) => {
  const { endCursorMap, isLoading } = useGetRemoteCursorsForUsers({
    currentUserId,
    userIds,
  });

  const localEndCursorMap = useGetLocalCursorsForUsers({
    currentUserId,
    userIds,
  });

  if (isLoading) {
    return { isLoading };
  }

  const userIdsWithUnreads = [];
  for (const [userId, remoteCursor] of endCursorMap.entries()) {
    const localCursor = localEndCursorMap?.get(userId);
    if (!localCursor || localCursor !== remoteCursor) {
      userIdsWithUnreads.push(userId);
    }
  }

  return { userIds: userIdsWithUnreads, isLoading };
};

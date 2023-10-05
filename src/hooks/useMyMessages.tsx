import { useState } from 'react';
import { useAppConfig } from './useAppConfig';
import { useUnreadMessages } from './useUnreadMessages';
import { useUser } from './useUser';
import { chunk, compact, find, merge, uniq } from 'lodash';
import {
  PrivatePostsData,
  UserData,
  useLookupUsers,
  useLookupUsersFirstPost,
} from './Circles/usePrivatePosts';
import { UseQueryResult } from '@tanstack/react-query';

export const useMyMessages = (tileId: string) => {
  const [pageIndex, setPageIndex] = useState(0);
  const appConfig = useAppConfig();
  const { data: userData } = useUser();
  const { unreadIds } = useUnreadMessages();
  const messageTile = find(
    appConfig.data?.homeTab?.messageTiles,
    (tile) => tile.id === tileId,
  );
  const recipientsUserIds = messageTile?.userIds.filter(
    (id) => id !== userData?.id,
  );

  // If unread isn't in the receipt list do not use it
  const permittedUnreadIds = unreadIds?.filter((id) =>
    recipientsUserIds?.includes(id),
  );

  // Unread messages always show on the top of the list
  const sortedList =
    permittedUnreadIds && recipientsUserIds
      ? uniq([...permittedUnreadIds, ...recipientsUserIds])
      : recipientsUserIds;

  // Break-down list of users into smaller chunks
  const recipientsListChunked = chunk(sortedList, 10);

  // Use current scroll-index to expand the list of users
  // in view up to the maximum
  const usersInView = compact(
    recipientsListChunked.flatMap((users, index) => {
      if (index <= pageIndex) {
        return users;
      }
    }),
  );

  // Construct object to identify which user
  // queries should be enabled
  const userQueryList = sortedList?.map((userId) => ({
    userId,
    enabled: usersInView.includes(userId),
  }));

  // Get user details (picture/displayName) for usersInView
  const userQueries = useLookupUsers(userQueryList);
  const userPostQueries = useLookupUsersFirstPost(userQueryList);

  const queries = merge(userQueries, userPostQueries) as UseQueryResult<
    PrivatePostsData & UserData,
    unknown
  >[];

  const userDetailsList = compact(
    queries.map(({ data }) => {
      if (!data?.privatePosts || !data.user) {
        return;
      }

      return {
        userId: data.user.userId,
        displayName: data.user.profile.displayName,
        picture: data.user.profile.picture,
        isUnread: unreadIds?.includes(data.user.userId) ?? false,
        message: data.privatePosts.edges?.[0]?.node.message,
      };
    }),
  );

  const isLoading = userQueries.some(
    ({ isInitialLoading }) => isInitialLoading,
  );

  const fetchNextPage = () => {
    if (recipientsListChunked.length - 1 > pageIndex) {
      // Expand list of users in view
      setPageIndex((currentIndex) => currentIndex + 1);
    }
  };

  const hasNextPage = recipientsListChunked.length - 1 > pageIndex;
  return { userDetailsList, isLoading, fetchNextPage, hasNextPage };
};

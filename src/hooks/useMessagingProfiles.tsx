import { useAppConfig } from './useAppConfig';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { UseQueryOptions, useQueries } from '@tanstack/react-query';
import { combineQueries } from '@lifeomic/one-query';

export type UserProfile = {
  id: string;
  profile: { displayName?: string; picture?: string; givenName?: string };
};

const createQueryOptions = (
  userId: string,
  fetchProfile: () => Promise<UserProfile>,
  options: UseQueryOptions<UserProfile>,
): UseQueryOptions<UserProfile> => ({
  ...options,
  queryKey: ['profile', userId],
  queryFn: fetchProfile,
  cacheTime: 1000 * 60 * 60 * 24,
});

const placeHolderProfile = (userId: string) => ({
  id: userId,
  profile: {
    displayName: userId,
  },
});

export const useMessagingProfiles = (userIds?: string[]) => {
  const { apiClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();

  const queries = useQueries({
    queries:
      userIds?.map((userId) =>
        createQueryOptions(
          userId,
          () =>
            apiClient
              .request(
                'GET /v1/account/users/:userId',
                { userId },
                { headers: accountHeaders },
              )
              .then((res) => res.data),
          {
            placeholderData: placeHolderProfile(userId),
          },
        ),
      ) ?? [],
  });

  // Use this `one-query` util to "combine" the result of `useQueries` into a single query.
  return combineQueries(queries);
};

export const useProfilesForTile = (tileId: string) => {
  const { data: appConfig } = useAppConfig();

  const messageTiles = appConfig?.homeTab?.messageTiles;
  const userIds = messageTiles?.find(
    (messageTile) => messageTile.id === tileId,
  )?.userIds;

  return useMessagingProfiles(userIds);
};

export const useProfilesForAllTiles = () => {
  const { data: appConfig } = useAppConfig();
  const messageTiles = appConfig?.homeTab?.messageTiles;
  const userIds = messageTiles?.flatMap((messageTile) => messageTile.userIds);
  return useMessagingProfiles(userIds);
};

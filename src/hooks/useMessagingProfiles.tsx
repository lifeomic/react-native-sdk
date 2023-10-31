import { useAppConfig } from './useAppConfig';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { compact } from 'lodash';
import { useUser } from './useUser';
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
            enabled: !!accountHeaders,
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
  const { data: userData } = useUser();

  const messageTiles = appConfig?.homeTab?.messageTiles;
  const userIds = messageTiles?.find(
    (messageTile) => messageTile.id === tileId,
  )?.userIds;

  const profiles = useMessagingProfiles(userIds);

  const relevantProfiles = compact(
    profiles.data?.filter((userProfile) => userIds?.includes(userProfile.id)),
  );

  return {
    all: relevantProfiles,
    others: relevantProfiles.filter((profile) => profile.id !== userData?.id),
    isLoading: profiles.isLoading,
    isFetching: profiles.isFetching,
  };
};
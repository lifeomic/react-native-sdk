import React, { createContext, useContext, useRef, useState } from 'react';
import { useAppConfig } from './useAppConfig';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { compact, uniq } from 'lodash';
import { useCache } from './CacheProvider';
import { useUser } from './useUser';

export type UserProfile = {
  id: string;
  profile: { displayName?: string; picture?: string; givenName?: string };
};

type UserProfilesContextProps = {
  getProfiles: () => UserProfile[];
  isLoading?: boolean;
};

export const UserProfilesContext = createContext<UserProfilesContextProps>({
  getProfiles: () => [],
  isLoading: undefined,
});

export const UserProfilesContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { accountHeaders, isLoading } = useActiveAccount();
  const { apiClient } = useHttpClient();
  const { cache } = useCache();
  const appConfig = useAppConfig();
  const profiles = useRef<Map<string, UserProfile>>(new Map());
  const placeHolderProfile = (userId: string) => ({
    id: userId,
    profile: {
      displayName: userId,
    },
  });
  const messageTiles = appConfig.data?.homeTab?.messageTiles;
  const userIds = uniq(messageTiles?.flatMap((tile) => tile.userIds));
  const [profileState, setProfileState] = useState<Map<string, UserProfile>>(
    new Map(Object.entries(userIds.map(placeHolderProfile))),
  );

  // Kick off background tasks to either pull a user's profile
  // from cache or fetch it
  const getUserProfilePromises = !isLoading
    ? userIds.map(async (userId) => {
        const cacheKey = `profile/${userId}`;
        const cachedItem = await cache?.get(cacheKey);

        if (!cachedItem) {
          return apiClient
            .request(
              'GET /v1/users/:userId',
              {
                userId,
              },
              { headers: accountHeaders },
            )
            .then((res) => {
              if (res.status === 200) {
                cache?.set(cacheKey, JSON.stringify(res.data));
                profiles.current?.set(`profile/${userId}`, res.data);
              }
            });
        }

        const userProfile = JSON.parse(cachedItem) as UserProfile;
        profiles.current?.set(`profile/${userId}`, userProfile);
      })
    : [];

  // After promises have settled update state
  Promise.all(getUserProfilePromises).then(() => {
    setProfileState(profiles.current);
  });

  const getProfiles = () => {
    return profileState ? Array.from(profileState, ([_, value]) => value) : [];
  };

  return (
    <UserProfilesContext.Provider
      value={{
        getProfiles,
      }}
    >
      {children}
    </UserProfilesContext.Provider>
  );
};

export const useUserProfiles = () => {
  const userProfilesContext = useContext(UserProfilesContext);
  if (!userProfilesContext) {
    throw new Error(
      'No UserProfilesContext.Provider found when calling useUserProfiles.',
    );
  }
  return userProfilesContext;
};

export const useProfilesForTile = (tileId: string) => {
  const { data: appConfig } = useAppConfig();
  const { data: userData } = useUser();
  const messageTiles = appConfig?.homeTab?.messageTiles;
  const userIds = messageTiles?.find(
    (messageTile) => messageTile.id === tileId,
  )?.userIds;

  console.log(JSON.stringify(userIds, undefined, 2));

  const { getProfiles } = useUserProfiles();
  const profiles = getProfiles();

  const relevantProfiles = compact(
    profiles?.filter((userProfile) => userIds?.includes(userProfile.id)),
  );

  return {
    all: relevantProfiles,
    others: relevantProfiles.filter((profile) => profile.id !== userData?.id),
  };
};

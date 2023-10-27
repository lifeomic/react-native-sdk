import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  const { accountHeaders, isLoading, account } = useActiveAccount();
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

  useEffect(() => {
    if (!isLoading && accountHeaders) {
      const getProfileFromCache = async (userId: string) => {
        const cacheKey = `profile/${userId}`;
        const cachedItem = await cache?.get(cacheKey);
        if (cachedItem) {
          const userProfile = JSON.parse(cachedItem) as UserProfile;
          profiles.current?.set(cacheKey, userProfile);
        }
        return cachedItem;
      };

      const fetchProfileFromApi = async (userId: string) => {
        const response = await apiClient.request(
          'GET /v1/users/:userId',
          { userId },
          { headers: accountHeaders },
        );

        if (response.status === 200) {
          const cacheKey = `profile/${userId}`;
          cache?.set(cacheKey, JSON.stringify(response.data));
          profiles.current?.set(cacheKey, response.data);
        }
      };

      const fetchUserProfile = async (userId: string) => {
        const cachedProfile = await getProfileFromCache(userId);
        if (!cachedProfile) {
          await fetchProfileFromApi(userId);
        }
      };

      const getUserProfilePromises =
        !isLoading && account ? userIds.map(fetchUserProfile) : [];

      Promise.all(getUserProfilePromises).then(() => {
        setProfileState(profiles.current);
      });
    }
  }, [isLoading, account, userIds, cache, apiClient, accountHeaders]);

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

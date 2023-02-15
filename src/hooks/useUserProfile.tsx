import { useMemo } from 'react';
import { useMe } from './useMe';
import { useUser } from './useUser';

export interface UserProfile {
  userId: string;
  profile: {
    email: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
  };
  patientId: string;
}

export function useUserProfile() {
  const {
    isLoading: meLoading,
    isFetched: meFetched,
    data: meData,
    error: meError,
  } = useMe();
  const {
    isLoading: userLoading,
    isFetched: userFetched,
    data: userData,
    error: userError,
  } = useUser();

  const userProfile = useMemo(() => {
    if (meData?.patientId && userData?.id) {
      return {
        userId: userData.id,
        profile: userData.profile,
        patientId: meData.patientId,
      } as UserProfile;
    }
  }, [meData, userData]);

  return {
    isLoading: meLoading || userLoading,
    isFetched: meFetched || userFetched,
    error: meError || userError,
    data: userProfile,
  };
}

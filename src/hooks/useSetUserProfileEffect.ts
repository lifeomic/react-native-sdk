import { useEffect } from 'react';
import { useActiveConfig } from './useActiveConfig';
import { useRestMutation } from './rest-api';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from './useSession';

export const useSetUserProfileEffect = () => {
  const client = useQueryClient();
  const { mutateAsync: updateUser } = useRestMutation('PATCH /v1/user', {
    onSuccess: (updatedUser) => {
      client.setQueryData(['user'], () => updatedUser);
    },
  });

  const { userConfiguration, isLoaded } = useSession();
  const { user } = userConfiguration;
  const { subject } = useActiveConfig();

  useEffect(() => {
    const hasFetchedUser = isLoaded;
    const userHasName = !!user?.profile.givenName || !!user?.profile.familyName;
    const name =
      subject?.name?.find((v) => v.use === 'official') ?? subject?.name?.[0];
    const subjectHasName = !!name?.family || !!name?.given?.length;

    if (hasFetchedUser && !userHasName && subjectHasName) {
      updateUser({
        profile: {
          givenName: name.given?.[0],
          familyName: name.family,
        },
      });
    }
  }, [user, updateUser, isLoaded, subject?.name]);
};

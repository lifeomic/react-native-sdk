import { useEffect } from 'react';
import { useActiveProject } from './useActiveProject';
import { useRestMutation } from './rest-api';
import { useQueryClient } from '@tanstack/react-query/build/lib/QueryClientProvider';
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
  const { activeSubject } = useActiveProject();

  useEffect(() => {
    const hasFetchedUser = isLoaded;
    const userHasName = !!user?.profile.givenName || !!user?.profile.familyName;
    const name =
      activeSubject?.name?.find((v) => v.use === 'official') ??
      activeSubject?.name?.[0];
    const subjectHasName = !!name?.family || !!name?.given?.length;

    if (hasFetchedUser && !userHasName && subjectHasName) {
      updateUser({
        profile: {
          givenName: name.given?.[0],
          familyName: name.family,
        },
      });
    }
  }, [user, activeSubject, updateUser, isLoaded]);
};

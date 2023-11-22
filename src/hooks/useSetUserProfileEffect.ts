import { useEffect } from 'react';
import { useActiveProject } from './useActiveProject';
import { useUpdateUser, useUser } from './useUser';

export const useSetUserProfileEffect = () => {
  const { isLoading, isFetched, data: user } = useUser();
  const { mutate: updateUser } = useUpdateUser();
  const { activeSubject } = useActiveProject();

  useEffect(() => {
    const hasFetchedUser = !isLoading && isFetched;
    const userHasName = !!user?.profile.givenName || !!user?.profile.familyName;
    const name =
      activeSubject.name?.find((v) => v.use === 'official') ??
      activeSubject.name?.[0];
    const subjectHasName = !!name?.family || !!name?.given?.length;

    if (hasFetchedUser && !userHasName && subjectHasName) {
      updateUser({
        profile: {
          givenName: name.given?.[0],
          familyName: name.family,
        },
      });
    }
  }, [isLoading, isFetched, user, activeSubject, updateUser]);
};

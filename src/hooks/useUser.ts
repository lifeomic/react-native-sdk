import { useAuth } from './useAuth';
import { useRestCache, useRestMutation, useRestQuery } from './rest-api';

export function useUser() {
  const { authResult } = useAuth();
  return useRestQuery(
    'GET /v1/user',
    {},
    { enabled: !!authResult?.accessToken },
  );
}

export const useUpdateUser = () => {
  const cache = useRestCache();
  return useRestMutation('PATCH /v1/user', {
    onSuccess: (user) => {
      cache.updateCache('GET /v1/user', {}, user);
    },
  });
};

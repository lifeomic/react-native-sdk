import { useRestCache, useRestMutation, useRestQuery } from './rest-api';

export function useUser() {
  return useRestQuery(
    'GET /v1/user',
    {},
    {
      // Do not include account header on this request.
      axios: { headers: { 'LifeOmic-Account': '' } },
    },
  );
}

export const useUpdateUser = () => {
  const cache = useRestCache();
  return useRestMutation('PATCH /v1/user', {
    // Do not include account header on this request.
    axios: { headers: { 'LifeOmic-Account': '' } },
    onSuccess: (user) => {
      cache.updateCache('GET /v1/user', {}, user);
    },
  });
};

import { useAuthenticatedQuery } from './useAuth';

export interface User {
  id: string;
  profile: {
    email: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
  };
}

export function useUser() {
  return useAuthenticatedQuery('user', (client) =>
    client.get<User>('/v1/user').then((res) => res.data),
  );
}

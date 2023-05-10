import { useQuery } from 'react-query';
import { useHttpClient } from './useHttpClient';
import { useAuth } from './useAuth';

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
  const { authResult } = useAuth();
  const { httpClient } = useHttpClient();

  return useQuery(
    'user',
    () => httpClient.get<User>('/v1/user').then((res) => res.data),
    {
      enabled: !!authResult?.accessToken,
    },
  );
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHttpClient } from './useHttpClient';
import { useAuth } from './useAuth';
import { useRestMutation } from './rest-api';
import { User } from '../types';

export function useUser() {
  const { authResult } = useAuth();
  const client = useQueryClient();
  const { httpClient } = useHttpClient();

  const result = useQuery(
    ['user'],
    () => httpClient.get<User>('/v1/user').then((res) => res.data),
    {
      enabled: !!authResult?.accessToken,
    },
  );

  const { mutateAsync: updateUser } = useRestMutation('PATCH /v1/user', {
    onSuccess: (updatedUser) => {
      client.setQueryData(['user'], () => updatedUser);
    },
  });

  return {
    ...result,
    updateUser,
  };
}

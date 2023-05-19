import { useMutation } from 'react-query';
import { useHttpClient } from './useHttpClient';
import { ProjectInvite } from '../types';

export function useAcceptInviteMutation() {
  const { httpClient } = useHttpClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      return httpClient
        .patch<ProjectInvite>(`/v1/invitations/${inviteId}`, {
          status: 'ACCEPTED',
        })
        .then((res) => res.data);
    },
  });
}

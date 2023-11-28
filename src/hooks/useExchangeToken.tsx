import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';

export function useExchangeToken(appTileId: string, clientId?: string) {
  const { apiClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();

  return useQuery(
    [
      'client-tokens',
      {
        targetClientId: clientId,
        appTileId,
      },
    ],
    () =>
      apiClient
        .request(
          'POST /v1/client-tokens',
          { targetClientId: clientId! },
          { headers: accountHeaders },
        )
        .then((res) => res.data),
    {
      enabled: !!clientId,
    },
  );
}

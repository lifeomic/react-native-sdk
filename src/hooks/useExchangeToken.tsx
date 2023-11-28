import { useQuery } from '@tanstack/react-query';
import { useHttpClient } from './useHttpClient';

export function useExchangeToken(appTileId: string, clientId?: string) {
  const { apiClient } = useHttpClient();

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
        .request('POST /v1/client-tokens', { targetClientId: clientId! })
        .then((res) => res.data),
    {
      enabled: !!clientId,
    },
  );
}

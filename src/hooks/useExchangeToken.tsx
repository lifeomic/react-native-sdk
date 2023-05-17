import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useAuth } from './useAuth';
import { useHttpClient } from './useHttpClient';

export type ExchangeResult = {
  code: string;
};

export function useExchangeToken(appTileId: string, clientId?: string) {
  const { httpClient } = useHttpClient();
  const { authResult } = useAuth();
  const { accountHeaders } = useActiveAccount();

  return useQuery(
    [
      'client-tokens',
      {
        accessToken: authResult?.accessToken,
        targetClientId: clientId,
        appTileId,
      },
    ],
    () => {
      return httpClient
        .post<ExchangeResult>(
          '/v1/client-tokens',
          {
            accessToken: authResult?.accessToken,
            targetClientId: clientId,
          },
          {
            headers: { ...accountHeaders },
          },
        )
        .then((res) => res.data);
    },
    {
      enabled: !!accountHeaders && !!authResult?.accessToken && !!clientId,
    },
  );
}

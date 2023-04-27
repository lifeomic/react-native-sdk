import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useAuth } from './useAuth';
import { useHttpClient } from './useHttpClient';
import { useUser } from './useUser';

export type ExchangeResult = {
  code: string;
};

export function useExchangeToken(clientId?: string) {
  const { httpClient } = useHttpClient();
  const { authResult } = useAuth();
  const { accountHeaders } = useActiveAccount();
  const { data, isFetched } = useUser();

  return useQuery(
    [
      'client-tokens',
      {
        accessToken: authResult?.accessToken,
        targetClientId: clientId,
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
            headers: { ...accountHeaders, 'LifeOmic-User': data?.id },
          },
        )
        .then((res) => res.data);
    },
    {
      enabled:
        !!accountHeaders &&
        !!authResult?.accessToken &&
        !!isFetched &&
        !!clientId,
    },
  );
}

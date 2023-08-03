import { useActiveAccount } from './useActiveAccount';
import { useAuth, useAuthenticatedQuery } from './useAuth';

export type ExchangeResult = {
  code: string;
};

export function useExchangeToken(appTileId: string, clientId?: string) {
  const { authResult } = useAuth();
  const { accountHeaders } = useActiveAccount();

  return useAuthenticatedQuery(
    [
      'client-tokens',
      {
        accessToken: authResult?.accessToken,
        targetClientId: clientId,
        appTileId,
      },
    ],
    (client) =>
      client
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
        .then((res) => res.data),
    {
      enabled: !!accountHeaders && !!clientId,
    },
  );
}

import { useActiveAccount } from './useActiveAccount';
import { useAuthenticatedQuery } from './useAuth';

type Response<T extends string> = Record<T, boolean>;

export function useFeature<T extends string>(feature: T) {
  const { accountHeaders } = useActiveAccount();

  return useAuthenticatedQuery(
    ['Features', feature],
    (client) =>
      client.get<Response<T>>(`/v1/features/${feature}`, {
        headers: accountHeaders,
      }),
    {
      enabled: !!accountHeaders,
      select(data) {
        return !!data.data[feature];
      },
    },
  );
}

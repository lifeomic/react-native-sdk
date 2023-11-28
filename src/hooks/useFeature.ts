import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';

type Response<T extends string> = Record<T, boolean>;

export function useFeature<T extends string>(feature: T) {
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();

  return useQuery(
    ['Features', feature],
    () =>
      httpClient.get<Response<T>>(`/v1/features/${feature}`, {
        headers: accountHeaders,
      }),
    {
      select(data) {
        return !!data.data[feature];
      },
    },
  );
}

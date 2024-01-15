import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useHttpClient } from './useHttpClient';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import queryString from 'query-string';

export function useExchangeToken<Selected = { code: string }>(
  uniqueExchangeId: string,
  clientId: string,
  options?: Omit<
    UseQueryOptions<{ code: string }, unknown, Selected>,
    'queryKey' | 'queryFn'
  >,
) {
  const { apiClient } = useHttpClient();

  return useQuery(
    [
      'client-tokens',
      {
        targetClientId: clientId,
        uniqueExchangeId,
      },
    ],
    () =>
      apiClient
        .request('POST /v1/client-tokens', { targetClientId: clientId })
        .then((res) => res.data),
    options,
  );
}

export type UseAuthedAppletUrlOptions = {
  /** A unique id to identify this particular exchange instance. */
  exchangeId: string;
  appletUrl: string;
  clientId: string;
  searchParams?: Record<string, string>;
};

export const useAuthedAppletUrl = ({
  exchangeId,
  appletUrl,
  clientId,
  searchParams,
}: UseAuthedAppletUrlOptions) => {
  const { account } = useActiveAccount();
  const { activeProject, activeSubjectId } = useActiveProject();
  return useExchangeToken(exchangeId, clientId, {
    select: ({ code }) => {
      const queryParams = {
        code,
        accountId: account,
        projectId: activeProject.id,
        patientId: activeSubjectId,
        ...searchParams,
      };

      return {
        url: `${appletUrl}?${queryString.stringify(queryParams)}`,
      };
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useActiveConfig } from '../useActiveConfig';
import { useHttpClient } from '../useHttpClient';
import { CircleTile } from '../../types';

export function useJoinCircles() {
  const { appConfig, subject } = useActiveConfig();
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();

  return useQuery(
    [`/v1/life-research/projects/${subject?.projectId}/app-config/circles`],
    () => {
      if (appConfig?.homeTab?.circleTiles?.some((c) => !c.isMember)) {
        httpClient
          .patch<CircleTile[]>(
            `/v1/life-research/projects/${subject?.projectId}/app-config/circles`,
            appConfig.homeTab.circleTiles.map((c) => ({
              ...c,
              isMember: true,
            })),
            { headers: accountHeaders },
          )
          .then((res) => {
            return res.data;
          });
      }
    },
    {
      enabled:
        !!accountHeaders &&
        !!subject?.projectId &&
        !!appConfig?.homeTab?.circleTiles,
    },
  );
}

import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useActiveProject } from '../useActiveProject';
import { useHttpClient } from '../useHttpClient';
import { CircleTile } from '../../types';

export function useJoinCircles() {
  const { activeSubject } = useActiveProject();
  const data = activeSubject?.project?.appConfig;
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();

  return useQuery(
    [
      `/v1/life-research/projects/${activeSubject?.project?.id}/app-config/circles`,
    ],
    () => {
      if (data?.homeTab?.circleTiles?.some((c) => !c.isMember)) {
        httpClient
          .patch<CircleTile[]>(
            `/v1/life-research/projects/${activeSubject?.project?.id}/app-config/circles`,
            data.homeTab.circleTiles.map((c) => ({ ...c, isMember: true })),
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
        !!activeSubject?.project?.id &&
        !!data?.homeTab?.circleTiles,
    },
  );
}

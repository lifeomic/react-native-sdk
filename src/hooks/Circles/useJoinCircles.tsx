import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useActiveProject } from '../useActiveProject';
import { CircleTile, useAppConfig } from '../useAppConfig';
import { useHttpClient } from '../useHttpClient';

export function useJoinCircles() {
  const { data } = useAppConfig();
  const { accountHeaders } = useActiveAccount();
  const { activeProject } = useActiveProject();
  const { httpClient } = useHttpClient();

  return useQuery(
    `/v1/life-research/projects/${activeProject?.id}/app-config/circles`,
    () => {
      if (data?.homeTab?.circleTiles?.some((c) => !c.isMember)) {
        httpClient
          .patch<CircleTile[]>(
            `/v1/life-research/projects/${activeProject?.id}/app-config/circles`,
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
        !!accountHeaders && !!activeProject?.id && !!data?.homeTab?.circleTiles,
    },
  );
}

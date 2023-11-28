import { useQuery } from '@tanstack/react-query';
import { useActiveProject } from '../useActiveProject';
import { CircleTile, useAppConfig } from '../useAppConfig';
import { useHttpClient } from '../useHttpClient';

export function useJoinCircles() {
  const { data } = useAppConfig();
  const { activeProject } = useActiveProject();
  const { httpClient } = useHttpClient();

  return useQuery(
    [`/v1/life-research/projects/${activeProject.id}/app-config/circles`],
    () => {
      if (data?.homeTab?.circleTiles?.some((c) => !c.isMember)) {
        httpClient
          .patch<CircleTile[]>(
            `/v1/life-research/projects/${activeProject.id}/app-config/circles`,
            data.homeTab.circleTiles.map((c) => ({ ...c, isMember: true })),
          )
          .then((res) => {
            return res.data;
          });
      }
    },
    {
      enabled: !!data?.homeTab?.circleTiles,
    },
  );
}

import { useActiveAccount } from '../useActiveAccount';
import { useActiveProject } from '../useActiveProject';
import { CircleTile, useAppConfig } from '../useAppConfig';
import { useAuthenticatedQuery } from '../useAuth';

export function useJoinCircles() {
  const { data } = useAppConfig();
  const { accountHeaders } = useActiveAccount();
  const { activeProject } = useActiveProject();

  return useAuthenticatedQuery(
    `/v1/life-research/projects/${activeProject?.id}/app-config/circles`,
    (client) => {
      if (data?.homeTab?.circleTiles?.some((c) => !c.isMember)) {
        client
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

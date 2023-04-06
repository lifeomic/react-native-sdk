import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { useHttpClient } from './useHttpClient';

export interface AppTile {
  id: string;
  title: string;
  source: {
    url: string;
  };
  icon?: string;
}

export interface AppConfig {
  homeTab?: {
    appTiles?: AppTile[];
  };
}

export function useAppConfig() {
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();
  const { activeProject } = useActiveProject();

  return useQuery(
    `/v1/life-research/projects/${activeProject?.id}/app-config`,
    () =>
      httpClient
        .get<AppConfig>(
          `/v1/life-research/projects/${activeProject?.id}/app-config`,
          { headers: accountHeaders },
        )
        .then((res) => res.data),
    {
      enabled: !!accountHeaders && !!activeProject?.id,
    },
  );
}

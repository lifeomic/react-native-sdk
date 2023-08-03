import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { Trace } from '../components/MyData/LineChart/TraceLine';
import { useAuthenticatedQuery } from './useAuth';

export interface AppTile {
  id: string;
  title: string;
  source: {
    url: string;
  };
  icon?: string;
  clientId?: string;
  scope?: string;
  callbackUrls?: string[];
}

export interface CircleTile {
  buttonText: string;
  circleName: string;
  circleId: string;
  isMember: boolean;
}

type Tile = 'todayTile' | 'trackTile' | 'pillarsTile' | 'myDataTile';

export interface AppConfig {
  homeTab?: {
    appTiles?: AppTile[];
    circleTiles?: CircleTile[];
    tiles?: Tile[];
    trackTileSettings?: { title: string; advancedScreenTrackers: string[] };
    pillarSettings?: { advancedScreenTrackers: string[] };
    myDataSettings?: {
      components: {
        type: 'LineChart';
        title: string;
        trace1: Trace;
        trace2?: Trace;
      }[];
    };
    todayTile?: AppTile;
    todayTileSettings?: {
      todayTile: AppTile;
      surveysTile: AppTile;
    };
  };
  onboardingCourse?: {
    url: string;
    title?: string;
  };
}

export function useAppConfig() {
  const { accountHeaders } = useActiveAccount();
  const { activeProject } = useActiveProject();

  return useAuthenticatedQuery(
    `/v1/life-research/projects/${activeProject?.id}/app-config`,
    (client) =>
      client
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

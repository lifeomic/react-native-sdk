import { useQuery } from '@tanstack/react-query';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { useHttpClient } from './useHttpClient';
import { Trace } from '../components/MyData/LineChart/TraceLine';

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

export interface MessageTile {
  id: string;
  providerUserIds: string;
  userIds: string[];
  role: string;
  displayName: string;
}

type Tile = 'todayTile' | 'trackTile' | 'pillarsTile' | 'myDataTile';

export interface AppConfig {
  homeTab?: {
    appTiles?: AppTile[];
    circleTiles?: CircleTile[];
    tiles?: Tile[];
    trackTileSettings?: { title: string; advancedScreenTrackers: string[] };
    messageTiles?: MessageTile[];
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
    screenHeader?: {
      title?: string;
    };
  };
  onboardingCourse?: {
    url: string;
    title?: string;
  };
}

export function useAppConfig() {
  const { accountHeaders } = useActiveAccount();
  const { httpClient } = useHttpClient();
  const { activeProject } = useActiveProject();

  return useQuery(
    [`/v1/life-research/projects/${activeProject?.id}/app-config`],
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

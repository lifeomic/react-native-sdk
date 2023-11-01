import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { Trace } from '../components/MyData/LineChart/TraceLine';
import { SvgProps } from 'react-native-svg';
import { useRestQuery } from './rest-api';

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
type TabType =
  | 'appTile'
  | 'customTab'
  | 'home'
  | 'notifications'
  | 'settings'
  | 'messageTile';

export interface AppConfig {
  homeTab?: {
    appTiles?: AppTile[];
    circleTiles?: CircleTile[];
    tiles?: Tile[];
    trackTileSettings?: {
      title: string;
      advancedScreenTrackers: string[];
      includePublic?: boolean;
    };
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
      enableRefresh?: boolean;
    };
    appTileSettings?: {
      appTiles: Record<string, { title?: string } | undefined>;
    };
  };
  onboardingCourse?: {
    url: string;
    title?: string;
  };
  support?: { url: string };
  brand?: Record<string, any>;
  tabsConfig?: {
    tabs: {
      type: TabType;
      name: string;
      label: string;
      icon?: string;
      svgProps?: SvgProps;
      svgPropsActive?: SvgProps;
      svgPropsInactive?: SvgProps;
      headerShown?: boolean;
      color?: string;
      initialParams?: any;
    }[];
  };
}

export const useAppConfig = () => {
  const { accountHeaders } = useActiveAccount();
  const { activeProject } = useActiveProject();
  return useRestQuery(
    'GET /v1/life-research/projects/:projectId/app-config',
    { projectId: activeProject?.id! },
    {
      enabled: !!activeProject && !!accountHeaders,
      axios: {
        headers: accountHeaders,
      },
    },
  );
};

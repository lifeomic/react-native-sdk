import { useEffect } from 'react';
import { useActiveProject } from './useActiveProject';
import { Trace } from '../components/MyData/LineChart/TraceLine';
import { SvgProps } from 'react-native-svg';
import { TextStyle, ViewStyle } from 'react-native';
import { useRestQuery } from './rest-api';
import { appConfigNotifier } from '../common/AppConfigNotifier';

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
  providerUserIds: string[];
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

export type TabStyle = {
  labelActiveText?: TextStyle;
  labelInactiveText?: TextStyle;
  activeIndicatorView?: ViewStyle;
  tabActiveView?: ViewStyle;
  tabInactiveView?: ViewStyle;
  svgProps?: SvgProps;
  svgPropsActive?: SvgProps;
  svgPropsInactive?: SvgProps;
};

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
    styles?: TabStyle;
    useTabBar?: boolean;
    tabs: {
      type: TabType;
      name: string;
      label: string;
      icon?: string;
      styles?: TabStyle;
      headerShown?: boolean;
      color?: string;
      initialParams?: any;
    }[];
  };
}

export const useAppConfig = () => {
  const { activeProject } = useActiveProject();

  const query = useRestQuery(
    'GET /v1/life-research/projects/:projectId/app-config',
    { projectId: activeProject.id },
  );

  useEffect(() => {
    appConfigNotifier.emit(query.data);
  }, [query.data]);

  return query;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useActiveProject } from './useActiveProject';
import { Trace } from '../components/MyData/LineChart/TraceLine';
import { SvgProps } from 'react-native-svg';
import { TextStyle, ViewStyle } from 'react-native';
import { useRestQuery } from './rest-api';
import { appConfigNotifier } from '../common/AppConfigNotifier';
import ms from 'ms';

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

type LineChart = {
  type: 'LineChart';
  title: string;
  trace1: Trace;
  trace2?: Trace;
};

type SleepChart = {
  type: 'SleepChart';
  title: string;
};

export type Chart = LineChart | SleepChart;

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
      components: Chart[];
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

export const useAppConfigList = () => {
  const { activeProject } = useActiveProject();

  const query = useRestQuery(
    'GET /v1/life-research/projects/:projectId/app-configs/list',
    { projectId: activeProject.id },
  );

  return query.data;
};

const useAppConfigById = (id?: string) => {
  const { activeProject } = useActiveProject();

  const query = useRestQuery(
    'GET /v1/life-research/projects/:projectId/app-configs/:id',
    { projectId: activeProject.id, id: id! },
    {
      // Longer stale time to avoid refetching every time someone changes pages.
      staleTime: ms('10m'),
      enabled: !!id,
    },
  );

  useEffect(() => {
    appConfigNotifier.emit(query.data);
  }, [query.data]);

  return query;
};

export type AppConfigContext = {
  appConfigId: string | undefined;
  setAppConfigId: (id: string) => void;
  data: AppConfig | undefined;
  isLoading: boolean;
  isFetched: boolean;
  error: any;
};

const AppConfigContext = createContext<AppConfigContext>({
  appConfigId: undefined,
  setAppConfigId: () => {},
  data: undefined,
  isLoading: false,
  isFetched: false,
  error: undefined,
});

export const AppConfigContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const configList = useAppConfigList();
  const [appConfigId, setAppConfigId] = useState<string | undefined>();

  useEffect(() => {
    if (configList) {
      setAppConfigId(configList[0]?.id);
    }
  }, [configList]);

  const query = useAppConfigById(appConfigId);
  const context = {
    appConfigId,
    setAppConfigId,
    data: query.data,
    isLoading: query.isLoading,
    isFetched: query.isFetched,
    error: query.error,
  };

  return (
    <AppConfigContext.Provider value={context}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => useContext(AppConfigContext);

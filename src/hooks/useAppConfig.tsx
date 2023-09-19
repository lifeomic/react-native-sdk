import React, { createContext, useContext, useRef, useState } from 'react';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { Trace } from '../components/MyData/LineChart/TraceLine';
import { useHttpClient } from './useHttpClient';
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
  };
  onboardingCourse?: {
    url: string;
    title?: string;
  };
  supportLink?: string;
  brand?: Record<string, any>;
}

type AppConfigContextProps = {
  data: AppConfig | undefined;
  isLoading: boolean | undefined;
  isFetched: boolean | undefined;
  error: any;
};
const AppConfigContext = createContext<AppConfigContextProps>({
  data: undefined,
  isLoading: undefined,
  isFetched: undefined,
  error: undefined,
});

export const AppConfigContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { accountHeaders, account } = useActiveAccount();
  const { activeProject } = useActiveProject();
  const { apiClient } = useHttpClient();
  const [appConfig, setAppConfig] = useState<AppConfig | undefined>(undefined);
  const isLoading = useRef<boolean | undefined>(undefined);
  const error = useRef<undefined>(undefined);

  if (!appConfig && !!activeProject?.id && !!account) {
    isLoading.current = true;
    apiClient
      .request(
        'GET /v1/life-research/projects/:projectId/app-config',
        {
          projectId: activeProject?.id!,
        },
        { headers: accountHeaders },
      )
      .then((res) => {
        isLoading.current = false;
        error.current = undefined;
        setAppConfig(res.data);
        appConfigNotifier.emit(res.data);
      })
      .catch((err) => {
        isLoading.current = false;
        error.current = err;
        setAppConfig(undefined);
        appConfigNotifier.emit(undefined);
      });
  }

  return (
    <AppConfigContext.Provider
      value={{
        data: appConfig,
        isLoading: isLoading.current,
        error: error.current,
        isFetched: !!appConfig,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const appConfigContext = useContext(AppConfigContext);
  if (!appConfigContext) {
    throw new Error(
      'No AppConfigContext.Provider found when calling useAppConfig.',
    );
  }
  return appConfigContext;
};

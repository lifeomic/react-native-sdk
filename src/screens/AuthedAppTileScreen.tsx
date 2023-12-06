import React, { useState, useLayoutEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { Appbar } from 'react-native-paper';
import {
  AppTile,
  useAppConfig,
  useHandleAppTileEvents,
  useStyles,
} from '../hooks';
import { StackScreenProps } from '@react-navigation/stack';
import { useIcons } from '../components';
import { defaultStyles as AppNavHeaderStyles } from '../components/AppNavHeader';
import { AuthedWebApplet } from '../components/AuthedWebApplet';

export type AuthedAppTileParams = {
  appTile: AppTile;
  searchParams?: { [key: string]: string };
  refreshTodayCountOnRemove?: boolean;
  tabMode?: boolean;
};
type AuthedAppTileScreenProps = StackScreenProps<
  Record<string, AuthedAppTileParams>,
  string
>;

export const AuthedAppTileScreen = ({
  navigation,
  route,
}: AuthedAppTileScreenProps) => {
  const { appTile, tabMode, searchParams = {} } = route.params;
  const { ChevronLeft } = useIcons();
  const webViewRef = useRef<WebView>(null);
  const { data: appConfig } = useAppConfig();
  const [canGoBack, setCanGoBack] = useState(false);
  const { styles } = useStyles(AppNavHeaderStyles);
  const titleOverride =
    appConfig?.homeTab?.appTileSettings?.appTiles[appTile.id]?.title;

  const { handleAppTileMessage, handleAppTileNavigationStateChange } =
    useHandleAppTileEvents(webViewRef.current);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: titleOverride || route.params.appTile.title,
      headerLeft: tabMode
        ? () => (
            <Appbar.Action
              icon={ChevronLeft}
              color={styles.backActionIcon?.color}
              onPress={() => webViewRef.current?.goBack()}
              style={styles.backAction}
              disabled={!canGoBack}
            />
          )
        : undefined,
    });
  }, [
    navigation,
    route.params.appTile.title,
    titleOverride,
    canGoBack,
    tabMode,
    ChevronLeft,
    styles.backAction,
    styles.backActionIcon?.color,
  ]);

  return (
    <AuthedWebApplet
      appTile={appTile}
      searchParams={searchParams}
      onMessage={handleAppTileMessage}
      onNavigationStateChange={(e) => {
        setCanGoBack(e.canGoBack);
        handleAppTileNavigationStateChange(e);
      }}
    />
  );
};

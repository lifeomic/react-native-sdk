import React, { useCallback, useState, useLayoutEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { Appbar } from 'react-native-paper';
import {
  AppTile,
  useAppConfig,
  useAuthedAppletUrl,
  useHandleAppTileEvents,
  useStyles,
} from '../hooks';
import { ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useIcons } from '../components';
import { defaultStyles as AppNavHeaderStyles } from '../components/AppNavHeader';

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

  const query = useAuthedAppletUrl({
    exchangeId: appTile.id,
    appletUrl: appTile.callbackUrls?.[0]!,
    clientId: appTile.clientId!,
    searchParams,
  });
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const handlePageLoaded = () => {
    setIsPageLoaded(true);
  };

  const dispatchLXFocusEvent = useCallback(() => {
    if (webViewRef.current?.injectJavaScript && isPageLoaded) {
      const script = `
        window.dispatchEvent(new Event('lx-focus'));
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [isPageLoaded]);

  useFocusEffect(dispatchLXFocusEvent);

  // Do not proceed until the query has resolved
  if (!query.data) {
    return <ActivityIndicator animating={true} />;
  }

  const source = {
    uri: query.data.url,
  };

  return (
    <WebView
      key={source.uri}
      geolocationEnabled
      source={source}
      ref={webViewRef}
      cacheEnabled={false}
      incognito={true}
      onMessage={handleAppTileMessage}
      onNavigationStateChange={(e: any) => {
        setCanGoBack(e.canGoBack);
        handleAppTileNavigationStateChange(e);
      }}
      onLoad={handlePageLoaded}
      testID="app-tile-webview"
    />
  );
};

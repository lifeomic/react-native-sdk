import React, { useCallback, useState, useLayoutEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import {
  useActiveAccount,
  useActiveProject,
  useExchangeToken,
  useHandleAppTileEvents,
} from '../hooks';
import queryString from 'query-string';
import { ActivityIndicator } from 'react-native-paper';
import { HomeStackScreenProps } from '../navigators/types';
import { useFocusEffect } from '@react-navigation/native';

export const AuthedAppTileScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/AuthedAppTile'>) => {
  const { appTile, searchParams = {} } = route.params;
  const webViewRef = useRef<WebView>(null);
  const { handleAppTileMessage, handleAppTileNavigationStateChange } =
    useHandleAppTileEvents(webViewRef.current);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.appTile.title,
    });
  }, [navigation, route.params.appTile.title]);

  const {
    activeProject,
    activeSubjectId,
    isLoading: loadingProject,
    isFetched: projectedFetched,
  } = useActiveProject();
  const {
    account,
    isLoading: loadingAccounts,
    isFetched: accountFetched,
  } = useActiveAccount();
  const {
    data,
    isLoading: loadingCode,
    isFetched: codeFetched,
  } = useExchangeToken(appTile.id, appTile.clientId);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Conditions to be met before building the applet uri
  const isLoading = loadingCode || loadingAccounts || loadingProject;
  const isFetched = codeFetched && accountFetched && projectedFetched;
  const hasData = data?.code && account?.id && activeProject?.id;

  const readyToBuildUri = isFetched && !isLoading && hasData;
  const oauthCallbackUrl = appTile.callbackUrls?.[0]!;

  const buildUri = useCallback(() => {
    const parsed = queryString.parse('');
    if (data?.code) {
      parsed.code = data.code;
    }

    if (account?.id) {
      parsed.accountId = account.id;
    }

    if (activeProject?.id) {
      parsed.projectId = activeProject.id;
    }

    if (activeSubjectId) {
      parsed.patientId = activeSubjectId;
    }

    for (const [key, value] of Object.entries(searchParams)) {
      parsed[key] = value;
    }

    return `${oauthCallbackUrl}?${queryString.stringify(parsed)}`;
  }, [
    account,
    activeProject,
    data,
    oauthCallbackUrl,
    activeSubjectId,
    searchParams,
  ]);

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

  // Do not proceed until all queries have resolved
  if (!readyToBuildUri) {
    return <ActivityIndicator animating={true} />;
  }

  const source = {
    uri: buildUri(),
  };

  return (
    <WebView
      key={source.uri}
      geolocationEnabled
      source={source}
      ref={webViewRef}
      cacheEnabled={false}
      onMessage={handleAppTileMessage}
      onNavigationStateChange={handleAppTileNavigationStateChange}
      onLoad={handlePageLoaded}
      testID="app-tile-webview"
    />
  );
};

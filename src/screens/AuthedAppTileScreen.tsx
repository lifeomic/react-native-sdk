import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { HomeStackParamList } from '../navigators/HomeStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useActiveAccount, useActiveProject, useExchangeToken } from '../hooks';
import queryString from 'query-string';
import { ActivityIndicator } from 'react-native-paper';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home/AuthedAppTile'>;

export const AuthedAppTileScreen = ({ navigation, route }: Props) => {
  const appTile = route.params.appTile;
  const webViewRef = useRef<WebView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.appTile.title,
    });
  }, [navigation, route.params.appTile.title]);

  const {
    activeProject,
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
  } = useExchangeToken(appTile.clientId);

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

    // These params will only be needed for LifeOmic app tiles
    if (account?.id) {
      parsed.accountId = account.id;
    }

    if (activeProject?.id) {
      parsed.projectId = activeProject.id;
    }
    return `${oauthCallbackUrl}?${queryString.stringify(parsed)}`;
  }, [account, activeProject, data, oauthCallbackUrl]);

  // Do not proceed until all queries have resolved
  if (!readyToBuildUri) {
    return <ActivityIndicator animating={true} />;
  }

  const source = {
    uri: buildUri(),
  };

  return (
    <WebView
      geolocationEnabled
      source={source}
      ref={webViewRef}
      cacheEnabled={false}
    />
  );
};

import React, { useCallback, useState, useRef } from 'react';
import { WebView, WebViewProps } from 'react-native-webview';
import {
  AppTile,
  useActiveAccount,
  useActiveProject,
  useExchangeToken,
} from '../hooks';
import queryString from 'query-string';
import { ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StyleProp, ViewStyle } from 'react-native';

export type AuthedWebAppletProps = {
  style?: StyleProp<ViewStyle>;
  appTile: AppTile;
  searchParams?: { [key: string]: string };
  onMessage?: WebViewProps['onMessage'];
  onNavigationStateChange?: WebViewProps['onNavigationStateChange'];
};

export const AuthedWebApplet: React.FC<AuthedWebAppletProps> = ({
  style,
  appTile,
  searchParams = {},
  onMessage,
  onNavigationStateChange,
}) => {
  const webViewRef = useRef<WebView>(null);

  const { activeProject, activeSubjectId } = useActiveProject();
  const { account } = useActiveAccount();

  const tokenQuery = useExchangeToken(appTile.id, appTile.clientId);

  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // Use this focus effect to notify the applet when it receives focus.
  useFocusEffect(
    useCallback(() => {
      if (webViewRef.current?.injectJavaScript && isPageLoaded) {
        const script = `
          window.dispatchEvent(new Event('lx-focus'));
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    }, [isPageLoaded]),
  );

  if (tokenQuery.status !== 'success') {
    return <ActivityIndicator animating={true} />;
  }

  const oauthCallbackUrl = appTile.callbackUrls?.[0]!;

  const queryParams = {
    code: tokenQuery.data.code,
    accountId: account,
    projectId: activeProject.id,
    patientId: activeSubjectId,
    ...searchParams,
  };

  const url = `${oauthCallbackUrl}?${queryString.stringify(queryParams)}`;

  const handlePageLoaded = () => {
    setIsPageLoaded(true);
  };

  return (
    <WebView
      style={style}
      key={url}
      geolocationEnabled
      source={{ uri: url }}
      ref={webViewRef}
      cacheEnabled={false}
      incognito={true}
      onMessage={onMessage}
      onNavigationStateChange={onNavigationStateChange}
      onLoad={handlePageLoaded}
      testID="app-tile-webview"
    />
  );
};

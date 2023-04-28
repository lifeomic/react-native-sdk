import React, { useLayoutEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { HomeStackScreenProps } from '../navigators/types';

export const AppTileScreen = ({
  navigation,
  route,
}: HomeStackScreenProps<'Home/AppTile'>) => {
  const appTile = route.params.appTile;
  const webViewRef = useRef<WebView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.appTile.title,
    });
  }, [navigation, route.params.appTile.title]);

  return (
    <WebView
      geolocationEnabled
      source={{ uri: appTile.source.url }}
      ref={webViewRef}
      cacheEnabled={false}
    />
  );
};

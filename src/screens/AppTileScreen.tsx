import React, { useLayoutEffect, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { HomeStackParamList } from '../navigators/HomeStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home/AppTile'>;

export const AppTileScreen = ({ navigation, route }: Props) => {
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

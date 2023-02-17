import React, { useLayoutEffect } from 'react';
import { WebView } from 'react-native-webview';
import { HomeStackParamList } from '../navigators/HomeStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<HomeStackParamList, 'tiles/AppTile'>;

const AppTileScreen = ({ navigation, route }: Props) => {
  const appTile = route.params.appTile;
  const webViewRef = React.useRef<WebView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: route.params.appTile.title,
    });
  });

  return (
    <WebView
      geolocationEnabled
      source={{ uri: appTile.source.url }}
      ref={webViewRef}
      cacheEnabled={false}
    />
  );
};

export default AppTileScreen;

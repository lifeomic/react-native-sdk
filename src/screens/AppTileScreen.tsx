import React, { useLayoutEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { Appbar } from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { AppTile, useHandleAppTileEvents, useStyles } from '../hooks';
import { useIcons } from '../components/BrandConfigProvider';
import { defaultStyles as AppNavHeaderStyles } from '../components/AppNavHeader';

export type AppTileParams = { appTile: AppTile; tabMode?: boolean };
type AppTileScreenProps = StackScreenProps<
  Record<string, AppTileParams>,
  string
>;

export const AppTileScreen = ({ navigation, route }: AppTileScreenProps) => {
  const { appTile, tabMode } = route.params;
  const { ChevronLeft } = useIcons();
  const [canGoBack, setCanGoBack] = useState(false);
  const { styles } = useStyles(AppNavHeaderStyles);
  const webViewRef = useRef<WebView>(null);
  const { handleAppTileNavigationStateChange } = useHandleAppTileEvents(
    webViewRef.current,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: route.params.appTile.title,
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
    canGoBack,
    tabMode,
    ChevronLeft,
    styles.backAction,
    styles.backActionIcon?.color,
  ]);

  return (
    <WebView
      geolocationEnabled
      source={{ uri: appTile.source.url }}
      ref={webViewRef}
      cacheEnabled={false}
      onNavigationStateChange={(e: any) => {
        setCanGoBack(e.canGoBack);
        handleAppTileNavigationStateChange(e);
      }}
    />
  );
};

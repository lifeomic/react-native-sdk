import React, { useCallback, useEffect, useState } from 'react';
import { t } from 'i18next';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { TilesList } from '../components/tiles/TilesList';
import { ScreenSurface } from '../components/ScreenSurface';
import { HomeStackScreenProps } from '../navigators/types';
import { useJoinCircles } from '../hooks';
import { refreshNotifier } from '../common/RefreshNotifier';
import { HeaderLeftRefreshButton } from '../components/HeaderLeftRefreshButton';

export const HomeScreen = (navProps: HomeStackScreenProps<'Home'>) => {
  const { isLoading: loadingAccount } = useActiveAccount();
  const { isInitialLoading: loadingAppConfig, data: appConfig } =
    useAppConfig();
  const { isInitialLoading: loadingJoinCircles } = useJoinCircles();
  const [refreshing, setRefreshing] = useState(false);
  const { navigation } = navProps;
  const customHeaderTitle = appConfig?.homeTab?.screenHeader?.title;
  const headerRefreshEnabled = appConfig?.homeTab?.screenHeader?.enableRefresh;

  const refresh = useCallback(async () => {
    if (refreshing) {
      return;
    }
    refreshNotifier.emit({ context: 'HomeScreen' });
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshing, setRefreshing]);

  useEffect(() => {
    if (customHeaderTitle) {
      navigation.setOptions({
        title: customHeaderTitle,
      });
    }
  }, [navigation, customHeaderTitle]);

  useEffect(() => {
    if (headerRefreshEnabled) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderLeftRefreshButton
            refreshing={refreshing}
            onRefresh={refresh}
          />
        ),
      });
    }
  }, [navigation, refreshing, refresh, headerRefreshEnabled]);

  if (loadingAccount) {
    return (
      <ActivityIndicatorView
        message={t(
          'home-screen-loading-account',
          'Loading account information',
        )}
      />
    );
  }

  if (loadingAppConfig) {
    return (
      <ActivityIndicatorView
        message={t('home-screen-loading-config', 'Loading app config')}
      />
    );
  }

  if (loadingJoinCircles) {
    return (
      <ActivityIndicatorView
        message={t('home-screen-joining-circles', 'Joining available circles')}
      />
    );
  }

  return (
    <ScreenSurface testID="home-screen">
      <TilesList {...navProps} />
    </ScreenSurface>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import { TilesList } from '../components/tiles/TilesList';
import { ScreenSurface } from '../components/ScreenSurface';
import { HomeStackScreenProps } from '../navigators/types';
import { refreshNotifier } from '../common/RefreshNotifier';
import { HeaderLeftRefreshButton } from '../components/HeaderLeftRefreshButton';
import { useActiveProject } from '../hooks/useActiveProject';

export const HomeScreen = (navProps: HomeStackScreenProps<'Home'>) => {
  const { activeSubject } = useActiveProject();
  const data = activeSubject?.project.appConfig;
  const [refreshing, setRefreshing] = useState(false);
  const { navigation } = navProps;
  const customHeaderTitle = data?.homeTab?.screenHeader?.title;
  const headerRefreshEnabled = data?.homeTab?.screenHeader?.enableRefresh;

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

  return (
    <ScreenSurface testID="home-screen">
      <TilesList {...navProps} />
    </ScreenSurface>
  );
};

import React, { useEffect } from 'react';
import { t } from 'i18next';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { TilesList } from '../components/tiles/TilesList';
import { ScreenSurface } from '../components/ScreenSurface';
import { HomeStackScreenProps } from '../navigators/types';
import { useJoinCircles } from '../hooks';

export const HomeScreen = (navProps: HomeStackScreenProps<'Home'>) => {
  const { isLoading: loadingAccount } = useActiveAccount();
  const { isLoading: loadingAppConfig, data: appConfig } = useAppConfig();
  const { isLoading: loadingJoinCircles } = useJoinCircles();
  const { navigation } = navProps;
  const customHeaderTitle = appConfig?.homeTab?.screenHeader?.title;

  useEffect(() => {
    if (customHeaderTitle) {
      navigation.setOptions({
        title: customHeaderTitle,
      });
    }
  }, [navigation, customHeaderTitle]);

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

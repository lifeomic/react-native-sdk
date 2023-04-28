import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { HomeStackParamList } from '../navigators/HomeStack';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { TilesList } from '../components/tiles/TilesList';
import { ScreenSurface } from '../components/ScreenSurface';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type HomeScreenNavigation = Props['navigation'];

export const HomeScreen = () => {
  const { isLoading: loadingAccount } = useActiveAccount();
  const { isLoading: loadingAppConfig } = useAppConfig();

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

  return (
    <ScreenSurface testID="home-screen">
      <TilesList />
    </ScreenSurface>
  );
};

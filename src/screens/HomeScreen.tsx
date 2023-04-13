import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from 'i18next';
import { HomeStackParamList } from '../navigators/HomeStack';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { TilesList } from '../components/tiles/TilesList';
import { TrackTile } from '../components/TrackTile';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type HomeScreenNavigation = Props['navigation'];

export const HomeScreen = () => {
  const { isLoading: loadingAccount } = useActiveAccount();
  const { isLoading: loadingAppConfig, data: appConfig } = useAppConfig();

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
    <View style={styles.container} testID="home-screen">
      <SafeAreaView>
        <ScrollView
          overScrollMode="always"
          showsVerticalScrollIndicator={false}
        >
          <TilesList
            TrackTile={<TrackTileWrapper />}
            tiles={appConfig?.homeTab?.appTiles}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function TrackTileWrapper() {
  const navigation = useNavigation<HomeScreenNavigation>();
  const { data: appConfig } = useAppConfig();

  // TODO: Push this logic to the useAppConfig hook
  const trackTileEnabled = appConfig?.homeTab?.tiles?.includes?.('trackTile');
  const title = appConfig?.homeTab?.trackTileSettings?.title;

  if (!trackTileEnabled) {
    return null;
  }

  return (
    <TrackTile
      onOpenTracker={(tracker, valuesContext) =>
        navigation.navigate('tiles/TrackTile', {
          tracker,
          valuesContext,
        })
      }
      title={title}
    />
  );
}

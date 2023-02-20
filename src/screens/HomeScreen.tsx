import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from 'i18next';
import { HomeStackParamList } from '../navigators/HomeStack';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { AppTile, useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { Tile } from '../components/tiles/Tile';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type HomeScreenNavigation = Props['navigation'];

export const HomeScreen = () => {
  const { isLoading: loadingAccount } = useActiveAccount();
  const { isLoading: loadingAppConfig, data: appConfig } = useAppConfig();
  const { navigate } = useNavigation<HomeScreenNavigation>();

  const onAppTilePress = useCallback(
    (appTile: AppTile) => () => {
      navigate('tiles/AppTile', { appTile });
    },
    [navigate],
  );

  if (loadingAccount || loadingAppConfig) {
    return (
      <ActivityIndicatorView
        message={t('home-screen-loading', 'Loading account information')}
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
          {/* TODO: as we add more tile types, refactor into TilesList to help
          with ordering, etc. */}
          {appConfig?.homeTab?.appTiles?.map((appTile) => (
            <Tile
              key={appTile.id}
              id={appTile.id}
              title={appTile.title}
              onPress={onAppTilePress(appTile)}
            />
          ))}
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

export default styles;

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
import { AppTiles } from '../components/tiles/AppTiles';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type HomeScreenNavigation = Props['navigation'];

export const HomeScreen = () => {
  const { isLoading: loadingAccount } = useActiveAccount();
  const { isLoading: loadingAppConfig, data: appConfig } = useAppConfig();
  const { navigate } = useNavigation<HomeScreenNavigation>();

  const onAppTilePress = useCallback(
    (appTile: AppTile) => {
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
          {appConfig?.homeTab?.appTiles?.length && (
            <AppTiles
              onPress={onAppTilePress}
              appTiles={appConfig.homeTab.appTiles}
            />
          )}
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

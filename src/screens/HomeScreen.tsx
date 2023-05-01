import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { t } from 'i18next';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useAppConfig } from '../hooks/useAppConfig';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { TilesList } from '../components/tiles/TilesList';
import { colors } from '../components/BrandConfigProvider/theme/base';
import { HomeStackScreenProps } from '../navigators/types';

export const HomeScreen = (navProps: HomeStackScreenProps<'Home'>) => {
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
    <View style={styles.container} testID="home-screen">
      <ScrollView overScrollMode="always" showsVerticalScrollIndicator={false}>
        <TilesList {...navProps} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
  },
});

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from 'i18next';
import { HomeStackParamList } from '../navigators/HomeStack';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type HomeScreenNavigation = Props['navigation'];

export const HomeScreen = () => {
  const { isLoading: loadingAccount, account } = useActiveAccount();

  if (loadingAccount) {
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
          {/* TODO: replace this text with appConfig & tiles */}
          <Text>{account?.name}</Text>
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

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/HomeStack';
import { ManageTrackers } from '../components/TrackTile/ManageTrackers/ManageTrackers';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type Props = NativeStackScreenProps<
  HomeStackParamList,
  'tiles/trackTileSettings'
>;

export const SettingsScreen = ({ navigation, route: { params } }: Props) => {
  const { valuesContext } = params;

  return (
    <View style={styles.container}>
      <ManageTrackers
        onOpenTracker={(tracker) =>
          navigation.navigate('tiles/TrackTile', {
            valuesContext,
            tracker,
          })
        }
      />
    </View>
  );
};

export default SettingsScreen;

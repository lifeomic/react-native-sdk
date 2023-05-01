import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeStackScreenProps } from '../navigators/types';
import { ManageTrackers } from '../components/TrackTile/ManageTrackers/ManageTrackers';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export const SettingsScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/TrackTileSettings'>) => {
  const { valuesContext } = params;

  return (
    <View style={styles.container}>
      <ManageTrackers
        onOpenTracker={(tracker) =>
          navigation.navigate('Home/TrackTile', {
            valuesContext,
            tracker,
          })
        }
      />
    </View>
  );
};

export default SettingsScreen;

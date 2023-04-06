import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TrackerDetails } from '../components/TrackTile/TrackerDetails/TrackerDetails';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/HomeStack';
import { t } from '@i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

type Props = NativeStackScreenProps<HomeStackParamList, 'tiles/TrackTile'>;

export const TrackTileTrackerScreen = ({
  navigation,
  route: { params },
}: Props) => {
  const { tracker, valuesContext } = params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('Track {name}', { name: tracker?.name }),
    });
  });

  return (
    <View style={styles.container}>
      <TrackerDetails
        tracker={tracker}
        valuesContext={valuesContext}
        canEditUnit={true}
      />
    </View>
  );
};

export default TrackTileTrackerScreen;

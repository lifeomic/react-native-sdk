import React from 'react';
import { View } from 'react-native';
import { HomeStackScreenProps } from '../navigators/types';
import { ManageTrackers } from '../components/TrackTile/ManageTrackers/ManageTrackers';
import { createStyles } from '../components';
import { useStyles } from '../hooks';

export const SettingsScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/TrackTileSettings'>) => {
  const { styles } = useStyles(defaultStyles);
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

const defaultStyles = createStyles('TrackTileSettingsScreen', () => ({
  container: {
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export default SettingsScreen;

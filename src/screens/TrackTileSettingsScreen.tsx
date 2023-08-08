import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { t } from 'i18next';
import { HomeStackScreenProps } from '../navigators/types';
import {
  ManageTrackers,
  EditingState,
} from '../components/TrackTile/ManageTrackers/ManageTrackers';
import { createStyles } from '../components';
import { useStyles } from '../hooks';
import { HeaderButton } from '../components/HeaderButton';

export const SettingsScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/TrackTileSettings'>) => {
  const { styles } = useStyles(defaultStyles);
  const [editingState, setEditingState] = useState<EditingState>();
  const { valuesContext } = params;

  useEffect(() => {
    navigation.setOptions({
      headerLeft:
        editingState === 'editing'
          ? () => (
              <HeaderButton
                title={t('track-tile-settings-screen-cancel', 'Cancel')}
                onPress={() => setEditingState(undefined)}
              />
            )
          : undefined,
      headerRight: () => (
        <HeaderButton
          title={
            editingState === 'editing'
              ? t('track-tile-settings-screen-cancel', 'Done')
              : t('track-tile-settings-screen-cancel', 'Edit')
          }
          onPress={() =>
            setEditingState(editingState === 'editing' ? 'done' : 'editing')
          }
        />
      ),
    });
  }, [editingState]);

  return (
    <View style={styles.container}>
      <ManageTrackers
        editingState={editingState}
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

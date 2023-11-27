import React, { useCallback, useEffect, useState } from 'react';
import { t } from 'i18next';
import { HomeStackScreenProps } from '../navigators/types';
import {
  ManageTrackers,
  EditingState,
} from '../components/TrackTile/ManageTrackers/ManageTrackers';
import { createStyles } from '../components/BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { HeaderButton } from '../components/HeaderButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const SettingsScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/TrackTileSettings'>) => {
  const { styles } = useStyles(defaultStyles);
  const [editingState, setEditingState] = useState<EditingState>();
  const { valuesContext } = params;

  const headerRight = useCallback(
    () => (
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
    [editingState],
  );

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
      headerRight,
    });
  }, [editingState, navigation, headerRight]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ManageTrackers
        editingState={editingState}
        onOpenTracker={(tracker) =>
          navigation.navigate('Home/TrackTile', {
            valuesContext,
            tracker,
          })
        }
      />
    </GestureHandlerRootView>
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

import React from 'react';
import { t } from '../../lib/i18n';
import { AdvancedTrackerEditor } from '../components/TrackTile/TrackerDetails/AdvancedTrackerEditor/AdvancedTrackerEditor';
import { HomeStackScreenProps } from '../navigators/types';
import { HeaderButton } from '../components/HeaderButton';
import { useNavigation } from '@react-navigation/native';
import { notifySaveEditTrackerValue } from '../components/TrackTile/services/EmitterService';

export const AdvancedTrackerEditorScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/AdvancedTrackerEditor'>) => {
  const { tracker, trackerValue, valuesContext } = params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Edit {{name}}', {
        name: tracker?.name,
      }),
      headerRight: SaveEditorButton,
    });
  });

  return (
    <AdvancedTrackerEditor
      tracker={tracker}
      valuesContext={valuesContext}
      trackerValue={trackerValue}
    />
  );
};

export const SaveEditorButton = () => {
  const navigation = useNavigation();
  return (
    <HeaderButton
      title={t('track-tile.save', 'Save')}
      onPress={async () => {
        navigation.goBack();
        await new Promise(notifySaveEditTrackerValue);
      }}
    />
  );
};

export default AdvancedTrackerEditorScreen;

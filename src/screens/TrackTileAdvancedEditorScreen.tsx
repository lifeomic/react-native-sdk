import React from 'react';
import { t } from '../../lib/i18n';
import { AdvancedTrackerEditor } from '../components/TrackTile/TrackerDetails/AdvancedTrackerEditor/AdvancedTrackerEditor';
import { HomeStackScreenProps } from '../navigators/types';

export const AdvancedTrackerEditorScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/AdvancedTrackerEditor'>) => {
  const { tracker, trackerValue, valuesContext } = params;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: t('Edit {name}', {
        name: tracker?.name,
      }),
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

export default AdvancedTrackerEditorScreen;

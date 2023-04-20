import React from 'react';
import { t } from '../../lib/i18n';
import { AdvancedTrackerEditor } from '../components/TrackTile/TrackerDetails/AdvancedTrackerEditor/AdvancedTrackerEditor';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/HomeStack';
type Props = NativeStackScreenProps<
  HomeStackParamList,
  'Home/AdvancedTrackerEditor'
>;

export const AdvancedTrackerEditorScreen = ({
  navigation,
  route: { params },
}: Props) => {
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

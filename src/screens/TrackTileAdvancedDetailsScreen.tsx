import React from 'react';
import { AdvancedTrackerDetails } from '../components/TrackTile/TrackerDetails/AdvancedTrackerDetails/AdvancedTrackerDetails';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/HomeStack';

type Props = NativeStackScreenProps<
  HomeStackParamList,
  'Home/AdvancedTrackerDetails'
>;

export const AdvancedTrackerDetailsScreen = ({
  navigation,
  route: { params },
}: Props) => {
  const { tracker, valuesContext } = params;

  React.useLayoutEffect(() =>
    navigation.setOptions({ headerTitle: tracker?.name }),
  );

  return (
    <AdvancedTrackerDetails
      tracker={tracker}
      valuesContext={valuesContext}
      onEditValue={(trackerValue) =>
        navigation.push('Home/AdvancedTrackerEditor', {
          tracker,
          trackerValue,
          valuesContext,
        })
      }
    />
  );
};

export default AdvancedTrackerDetailsScreen;

import React from 'react';
import { AdvancedTrackerDetails } from '../components/TrackTile/TrackerDetails/AdvancedTrackerDetails/AdvancedTrackerDetails';
import { HomeStackScreenProps } from '../navigators/types';

export const AdvancedTrackerDetailsScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/AdvancedTrackerDetails'>) => {
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

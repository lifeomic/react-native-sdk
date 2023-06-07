import React from 'react';
import { AdvancedTrackerDetails } from '../components/TrackTile/TrackerDetails/AdvancedTrackerDetails/AdvancedTrackerDetails';
import { HomeStackScreenProps } from '../navigators/types';

export const AdvancedTrackerDetailsScreen = ({
  navigation,
  route: { params },
}: HomeStackScreenProps<'Home/AdvancedTrackerDetails'>) => {
  const { tracker, valuesContext, referenceDate } = params;

  React.useLayoutEffect(() => navigation.setOptions({ title: tracker?.name }));

  return (
    <AdvancedTrackerDetails
      tracker={tracker}
      valuesContext={valuesContext}
      referenceDate={referenceDate}
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

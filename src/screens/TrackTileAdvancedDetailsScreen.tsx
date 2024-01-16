import React from 'react';
import { AdvancedTrackerDetails } from '../components/TrackTile/TrackerDetails/AdvancedTrackerDetails/AdvancedTrackerDetails';
import { HomeStackScreenProps } from '../navigators/types';
import { DefaultOnError } from '../components/TrackTile/common/DefaultOnError';

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
      onError={DefaultOnError}
      onEditValue={(trackerValue) =>
        navigation.push('Home/AdvancedTrackerEditor', {
          tracker,
          trackerValue: {
            ...trackerValue,
            createdDate: trackerValue.createdDate.toISOString(),
          },
          valuesContext,
        })
      }
    />
  );
};

export default AdvancedTrackerDetailsScreen;

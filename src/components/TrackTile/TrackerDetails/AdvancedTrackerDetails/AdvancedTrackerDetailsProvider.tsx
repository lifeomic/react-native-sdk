import React, { FC } from 'react';
import { FontOverridesProvider, FontWeights } from '../../styles';
import {
  AdvancedTrackerDetails,
  AdvancedTrackerDetailsProps,
} from './AdvancedTrackerDetails';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../../services/TrackTileService';

export type AdvancedTrackerDetailsProviderProps =
  AdvancedTrackerDetailsProps & {
    trackTileService: TrackTileService;
    fonts?: FontWeights;
  };

export const AdvancedTrackerDetailsProvider: FC<
  AdvancedTrackerDetailsProviderProps
> = (props) => {
  const { trackTileService, fonts, ...trackerDetailsProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <FontOverridesProvider value={fonts ?? {}}>
        <AdvancedTrackerDetails {...trackerDetailsProps} />
      </FontOverridesProvider>
    </TrackTileServiceProvider>
  );
};

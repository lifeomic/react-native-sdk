import React, { FC } from 'react';
import { FontOverridesProvider, FontWeights } from '../styles';
import { TrackerDetails, TrackerDetailsProps } from './TrackerDetails';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../services/TrackTileService';

export type TrackerDetailsProviderProps = TrackerDetailsProps & {
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const TrackerDetailsProvider: FC<TrackerDetailsProviderProps> = (
  props,
) => {
  const { trackTileService, fonts, ...trackerDetailsProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <FontOverridesProvider value={fonts ?? {}}>
        <TrackerDetails {...trackerDetailsProps} />
      </FontOverridesProvider>
    </TrackTileServiceProvider>
  );
};

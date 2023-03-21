import React, { FC } from 'react';
import {
  FontOverridesProvider,
  FontWeights,
  StyleOverridesProvider
} from '../styles';
import { Styles, TrackerDetails, TrackerDetailsProps } from './TrackerDetails';
import {
  TrackTileService,
  TrackTileServiceProvider
} from '../services/TrackTileService';

export type TrackerDetailsProviderProps = TrackerDetailsProps & {
  styles?: Styles;
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const TrackerDetailsProvider: FC<TrackerDetailsProviderProps> = (
  props
) => {
  const { trackTileService, styles, fonts, ...trackerDetailsProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <StyleOverridesProvider value={styles ?? {}}>
        <FontOverridesProvider value={fonts ?? {}}>
          <TrackerDetails {...trackerDetailsProps} />
        </FontOverridesProvider>
      </StyleOverridesProvider>
    </TrackTileServiceProvider>
  );
};

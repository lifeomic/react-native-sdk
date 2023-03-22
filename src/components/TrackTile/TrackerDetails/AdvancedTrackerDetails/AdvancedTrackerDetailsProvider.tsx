import React, { FC } from 'react';
import {
  FontOverridesProvider,
  FontWeights,
  StyleOverridesProvider,
} from '../../styles';
import {
  Styles,
  AdvancedTrackerDetails,
  AdvancedTrackerDetailsProps,
} from './AdvancedTrackerDetails';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../../services/TrackTileService';

export type AdvancedTrackerDetailsProviderProps =
  AdvancedTrackerDetailsProps & {
    styles?: Styles;
    trackTileService: TrackTileService;
    fonts?: FontWeights;
  };

export const AdvancedTrackerDetailsProvider: FC<
  AdvancedTrackerDetailsProviderProps
> = (props) => {
  const { trackTileService, styles, fonts, ...trackerDetailsProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <StyleOverridesProvider value={styles ?? {}}>
        <FontOverridesProvider value={fonts ?? {}}>
          <AdvancedTrackerDetails {...trackerDetailsProps} />
        </FontOverridesProvider>
      </StyleOverridesProvider>
    </TrackTileServiceProvider>
  );
};

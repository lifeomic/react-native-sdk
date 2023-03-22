import React, { FC } from 'react';
import {
  FontOverridesProvider,
  FontWeights,
  StyleOverridesProvider,
} from '../styles';
import { Styles, PillarsTileProps, PillarsTile } from './PillarsTile';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../services/TrackTileService';

export type PillarsTileProviderProps = PillarsTileProps & {
  styles?: Styles;
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const PillarsTileProvider: FC<PillarsTileProviderProps> = (props) => {
  const { trackTileService, styles, fonts, ...tileProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <StyleOverridesProvider value={styles ?? {}}>
        <FontOverridesProvider value={fonts ?? {}}>
          <PillarsTile {...tileProps} />
        </FontOverridesProvider>
      </StyleOverridesProvider>
    </TrackTileServiceProvider>
  );
};

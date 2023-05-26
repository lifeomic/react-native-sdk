import React, { FC } from 'react';
import { FontOverridesProvider, FontWeights } from '../styles';
import { PillarsTileProps, PillarsTile } from './PillarsTile';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../services/TrackTileService';

export type PillarsTileProviderProps = PillarsTileProps & {
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const PillarsTileProvider: FC<PillarsTileProviderProps> = (props) => {
  const { trackTileService, fonts, ...tileProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <FontOverridesProvider value={fonts ?? {}}>
        <PillarsTile {...tileProps} />
      </FontOverridesProvider>
    </TrackTileServiceProvider>
  );
};

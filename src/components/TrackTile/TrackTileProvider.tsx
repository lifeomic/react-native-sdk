import React, { FC } from 'react';
import {
  FontOverridesProvider,
  FontWeights,
  StyleOverridesProvider,
} from './styles';
import { Styles, TrackTile, TrackTileProps } from './TrackTile';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from './services/TrackTileService';

export type TrackTileProviderProps = TrackTileProps & {
  styles?: Styles;
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const TrackTileProvider: FC<TrackTileProviderProps> = (props) => {
  const { trackTileService, styles = {}, fonts = {}, ...tileProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <StyleOverridesProvider value={styles}>
        <FontOverridesProvider value={fonts}>
          <TrackTile {...tileProps} />
        </FontOverridesProvider>
      </StyleOverridesProvider>
    </TrackTileServiceProvider>
  );
};

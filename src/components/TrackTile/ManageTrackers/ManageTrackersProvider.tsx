import React, { FC } from 'react';
import {
  FontOverridesProvider,
  FontWeights,
  StyleOverridesProvider,
} from '../styles';
import { Styles, ManageTrackersProps, ManageTrackers } from './ManageTrackers';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../services/TrackTileService';

export type ManageTrackersProviderProps = ManageTrackersProps & {
  styles?: Styles;
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const ManageTrackersProvider: FC<ManageTrackersProviderProps> = (
  props,
) => {
  const { trackTileService, styles, fonts, ...manageTrackersProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <StyleOverridesProvider value={styles ?? {}}>
        <FontOverridesProvider value={fonts ?? {}}>
          <ManageTrackers {...manageTrackersProps} />
        </FontOverridesProvider>
      </StyleOverridesProvider>
    </TrackTileServiceProvider>
  );
};

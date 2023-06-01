import React, { FC } from 'react';
import { FontOverridesProvider, FontWeights } from '../styles';
import { ManageTrackersProps, ManageTrackers } from './ManageTrackers';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../services/TrackTileService';

export type ManageTrackersProviderProps = ManageTrackersProps & {
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const ManageTrackersProvider: FC<ManageTrackersProviderProps> = (
  props,
) => {
  const { trackTileService, fonts, ...manageTrackersProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <FontOverridesProvider value={fonts ?? {}}>
        <ManageTrackers {...manageTrackersProps} />
      </FontOverridesProvider>
    </TrackTileServiceProvider>
  );
};

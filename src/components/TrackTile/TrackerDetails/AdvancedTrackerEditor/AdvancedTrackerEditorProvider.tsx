import React, { FC } from 'react';
import { FontOverridesProvider, FontWeights } from '../../styles';
import {
  AdvancedTrackerEditor,
  AdvancedTrackerEditorProps,
} from './AdvancedTrackerEditor';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../../services/TrackTileService';

export type AdvancedTrackerEditorProviderProps = AdvancedTrackerEditorProps & {
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const AdvancedTrackerEditorProvider: FC<
  AdvancedTrackerEditorProviderProps
> = (props) => {
  const { trackTileService, fonts, ...trackerEditorProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <FontOverridesProvider value={fonts ?? {}}>
        <AdvancedTrackerEditor {...trackerEditorProps} />
      </FontOverridesProvider>
    </TrackTileServiceProvider>
  );
};

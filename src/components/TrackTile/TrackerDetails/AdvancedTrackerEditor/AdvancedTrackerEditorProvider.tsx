import React, { FC } from 'react';
import {
  FontOverridesProvider,
  FontWeights,
  StyleOverridesProvider,
} from '../../styles';
import {
  Styles,
  AdvancedTrackerEditor,
  AdvancedTrackerEditorProps,
} from './AdvancedTrackerEditor';
import {
  TrackTileService,
  TrackTileServiceProvider,
} from '../../services/TrackTileService';

export type AdvancedTrackerEditorProviderProps = AdvancedTrackerEditorProps & {
  styles?: Styles;
  trackTileService: TrackTileService;
  fonts?: FontWeights;
};

export const AdvancedTrackerEditorProvider: FC<
  AdvancedTrackerEditorProviderProps
> = (props) => {
  const { trackTileService, styles, fonts, ...trackerEditorProps } = props;

  return (
    <TrackTileServiceProvider value={trackTileService}>
      <StyleOverridesProvider value={styles ?? {}}>
        <FontOverridesProvider value={fonts ?? {}}>
          <AdvancedTrackerEditor {...trackerEditorProps} />
        </FontOverridesProvider>
      </StyleOverridesProvider>
    </TrackTileServiceProvider>
  );
};

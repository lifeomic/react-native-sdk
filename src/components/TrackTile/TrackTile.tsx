import React from 'react';
import OpenSettingsButton from './OpenSettingsButton';
import { TrackerRow } from './TrackerRow/TrackerRow';
import {
  Tracker,
  TrackerValuesContext,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
} from './services/TrackTileService';
import { useTrackers } from './hooks/useTrackers';
import { useTrackerValues } from './hooks/useTrackerValues';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../../hooks/useStyles';
import { Card } from 'react-native-paper';
import { useDeveloperConfig } from '../../hooks/useDeveloperConfig';

export type TrackTileProps = {
  title?: string;
  onOpenSettings: (valuesContext: TrackerValuesContext) => void;
  onOpenTracker: (metric: Tracker, valuesContext: TrackerValuesContext) => void;
  hideSettingsButton?: boolean;
  styles?: TrackTileStyles;
  shouldUseOntology?: boolean;
};

export function TrackTile({
  onOpenSettings,
  onOpenTracker,
  hideSettingsButton,
  title = '',
  styles: instanceStyles,
  shouldUseOntology,
}: TrackTileProps) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { componentProps } = useDeveloperConfig() || {};
  if (hideSettingsButton === undefined) {
    hideSettingsButton = componentProps?.TrackTile?.hideSettingsButton;
  }

  const valuesContext: TrackerValuesContext = {
    system: TRACKER_CODE_SYSTEM,
    codeBelow: TRACKER_CODE,
    shouldUseOntology: shouldUseOntology,
  };

  const { trackers, loading: trackersLoading } = useTrackers();
  const { trackerValues, loading: valuesLoading } =
    useTrackerValues(valuesContext);

  const settingsButton = (props: { size: number }) => {
    if (hideSettingsButton) {
      return null;
    }
    if (!title) {
      // The `size` prop defaults to 24 from React Native Paper
      props.size = 18;
    }
    return (
      <OpenSettingsButton
        {...props}
        onPress={() => onOpenSettings(valuesContext)}
      />
    );
  };

  const showTitleCard = title || !hideSettingsButton;

  return (
    <Card elevation={0} style={styles.cardView}>
      {showTitleCard && (
        <Card.Title
          title={title}
          titleStyle={styles.titleText}
          right={settingsButton}
          rightStyle={styles.settingsButton}
          style={title ? styles.titleView : styles.titleViewWithoutTitle}
        />
      )}
      <TrackerRow
        onOpenTracker={(tracker) => onOpenTracker(tracker, valuesContext)}
        trackers={trackers}
        values={trackerValues[0]}
        loading={trackersLoading || valuesLoading}
      />
    </Card>
  );
}

const defaultStyles = createStyles('TrackTile', (theme) => ({
  titleView: {
    marginVertical: -8,
  },
  titleViewWithoutTitle: {
    marginVertical: -24,
  },
  titleText: {},
  cardView: {
    marginBottom: theme.spacing.large,
  },
  settingsButton: {
    marginRight: theme.spacing.medium,
    marginTop: -8,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackTileStyles = NamedStylesProp<typeof defaultStyles>;

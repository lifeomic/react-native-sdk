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

export type TrackTileProps = {
  title?: string;
  onOpenSettings: (valuesContext: TrackerValuesContext) => void;
  onOpenTracker: (metric: Tracker, valuesContext: TrackerValuesContext) => void;
  hideSettingsButton?: boolean;
  styles?: TrackTileStyles;
};

export function TrackTile({
  onOpenSettings,
  onOpenTracker,
  hideSettingsButton = false,
  title = '',
  styles: instanceStyles,
}: TrackTileProps) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const valuesContext: TrackerValuesContext = {
    system: TRACKER_CODE_SYSTEM,
    codeBelow: TRACKER_CODE,
  };

  const { trackers, loading: trackersLoading } = useTrackers();
  const { trackerValues, loading: valuesLoading } =
    useTrackerValues(valuesContext);

  const settingsButton = (props: { size: number }) => {
    if (hideSettingsButton) {
      return null;
    }
    return (
      <OpenSettingsButton
        {...props}
        onPress={() => onOpenSettings(valuesContext)}
      />
    );
  };

  return (
    <Card elevation={0} style={styles.card}>
      {title && (
        <Card.Title
          title={title}
          titleStyle={styles.titleText}
          right={settingsButton}
          rightStyle={styles.settingsButton}
          style={styles.title}
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
  title: {
    marginVertical: -8,
  },
  titleText: {},
  card: {
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

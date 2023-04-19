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
import { SvgProps } from 'react-native-svg';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../../hooks/useStyles';
import { Card } from 'react-native-paper';

export type TrackTileProps = {
  title?: string;
  onOpenSettings: (valuesContext: TrackerValuesContext) => void;
  onOpenTracker: (metric: Tracker, valuesContext: TrackerValuesContext) => void;
  hideSettingsButton?: boolean;
  icons?: Record<string, React.ComponentType<SvgProps>>;
  styles?: TrackTileStyles;
};

export function TrackTile({
  onOpenSettings,
  onOpenTracker,
  hideSettingsButton = false,
  title = '',
  icons,
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
    if (hideSettingsButton) return null;
    return (
      <OpenSettingsButton
        {...props}
        onPress={() => onOpenSettings(valuesContext)}
      />
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title={title}
        titleStyle={styles.titleText}
        right={settingsButton}
        rightStyle={styles.settingsButton}
      />
      <Card.Content style={styles.content}>
        <TrackerRow
          onOpenTracker={(tracker) => onOpenTracker(tracker, valuesContext)}
          trackers={trackers}
          values={trackerValues[0]}
          loading={trackersLoading || valuesLoading}
          icons={icons}
        />
      </Card.Content>
    </Card>
  );
}

const defaultStyles = createStyles('TrackTile', (theme) => ({
  titleText: {
    margin: theme.spacing.medium,
  },
  card: {
    margin: theme.spacing.large,
  },
  settingsButton: {
    marginRight: theme.spacing.medium,
  },
  content: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackTileStyles = NamedStylesProp<typeof defaultStyles>;

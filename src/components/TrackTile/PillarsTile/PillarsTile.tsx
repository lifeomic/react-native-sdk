import React, { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { tID } from '../common/testID';
import { useTrackers } from '../hooks/useTrackers';
import { useTrackerValues } from '../hooks/useTrackerValues';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
  TRACKER_PILLAR_CODE,
  TRACKER_PILLAR_CODE_SYSTEM,
} from '../services/TrackTileService';
import { Pillar } from './Pillar';
import { Card } from 'react-native-paper';
import { useStyles } from '../../../hooks/useStyles';
import { createStyles } from '../../BrandConfigProvider';

export type PillarsTileProps = {
  onOpenDetails: (
    tracker: Tracker,
    valuesContext: TrackerValuesContext,
  ) => void;
  onSaveNewValueOverride?: (
    tracker: Tracker,
    newValue: number,
    originalTrackerValues?: TrackerValue[],
  ) => void;
  background?: ReactNode;
  styles?: PillarsTileStyles;
};

export const PillarsTile = ({
  onOpenDetails,
  onSaveNewValueOverride,
  styles: instanceStyles,
}: PillarsTileProps) => {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const valuesContext: TrackerValuesContext = {
    system: TRACKER_PILLAR_CODE_SYSTEM,
    codeBelow: TRACKER_PILLAR_CODE,
  };

  const { pillarTrackers, loading: trackersLoading } = useTrackers();
  const { trackerValues, loading: valuesLoading } =
    useTrackerValues(valuesContext);

  return (
    <Card style={styles.pillarsTileView}>
      <Card.Content style={styles.pillarsTileBackgroundContainer}>
        {trackersLoading && (
          <View style={styles.pillarsTileLoadingIndicatorView}>
            <ActivityIndicator
              testID={tID('pillars-loading')}
              accessibilityRole="progressbar"
              size="large"
            />
          </View>
        )}
        {!trackersLoading &&
          pillarTrackers.map((tracker) => {
            // 0 == today's values since useTrackers is only query for today
            const trackerDayValues = trackerValues[0][tracker.metricId ?? ''];
            return (
              <Pillar
                key={tracker.id}
                loading={valuesLoading}
                trackerValues={trackerDayValues}
                tracker={tracker}
                valuesContext={valuesContext}
                onOpenDetails={() => onOpenDetails(tracker, valuesContext)}
                onSaveNewValueOverride={
                  onSaveNewValueOverride
                    ? (newValue) =>
                        onSaveNewValueOverride(
                          tracker,
                          newValue,
                          trackerDayValues,
                        )
                    : undefined
                }
              />
            );
          })}
      </Card.Content>
    </Card>
  );
};

const defaultStyles = createStyles('PillarsTile', (theme) => ({
  pillarsTileView: {
    overflow: 'hidden',
    marginHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    backgroundColor: theme.colors.surface,
  },
  pillarsTileBackgroundContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 404,
  },
  pillarsTileLoadingIndicatorView: {
    height: '100%',
    justifyContent: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PillarsTileStyles = NamedStylesProp<typeof defaultStyles>;

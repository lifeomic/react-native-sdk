import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
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
import { NamedStyles, StylesProp, useStyleOverrides } from '../styles';
import { Pillar } from './Pillar';
import { Card } from 'react-native-paper';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}

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
  icons?: Record<string, React.ComponentType<SvgProps>>;
};

export const PillarsTile = ({
  onOpenDetails,
  onSaveNewValueOverride,
  icons,
}: PillarsTileProps) => {
  const styles = useStyleOverrides(defaultStyles);
  const valuesContext: TrackerValuesContext = {
    system: TRACKER_PILLAR_CODE_SYSTEM,
    codeBelow: TRACKER_PILLAR_CODE,
  };

  const { pillarTrackers, loading: trackersLoading } = useTrackers();
  const { trackerValues, loading: valuesLoading } =
    useTrackerValues(valuesContext);

  return (
    <Card style={styles.pillarsTile}>
      <Card.Content style={styles.pillarsTileBackgroundContainer}>
        {trackersLoading && (
          <View style={styles.pillarsTileLoadingIndicator}>
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
                icons={icons}
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

const defaultStyles = StyleSheet.create({
  pillarsTile: {
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  pillarsTileBackgroundContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 326,
  },
  pillarsTileLoadingIndicator: {
    height: '100%',
    justifyContent: 'center',
  },
});

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
  TRACKER_PILLAR_CODE_SYSTEM
} from '../services/TrackTileService';
import { NamedStyles, StylesProp, useStyleOverrides } from '../styles';
import { Pillar } from './Pillar';
import PillarsBackground from './PillarsBackground';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}

export type PillarsTileProps = {
  onOpenDetails: (
    tracker: Tracker,
    valuesContext: TrackerValuesContext
  ) => void;
  onSaveNewValueOverride?: (
    tracker: Tracker,
    newValue: number,
    originalTrackerValues?: TrackerValue[]
  ) => void;
  background?: ReactNode;
  icons?: Record<string, React.ComponentType<SvgProps>>;
};

export const PillarsTile = ({
  onOpenDetails,
  onSaveNewValueOverride,
  background = <PillarsBackground />,
  icons
}: PillarsTileProps) => {
  const styles = useStyleOverrides(defaultStyles);
  const valuesContext: TrackerValuesContext = {
    system: TRACKER_PILLAR_CODE_SYSTEM,
    codeBelow: TRACKER_PILLAR_CODE
  };

  const { pillarTrackers, loading: trackersLoading } = useTrackers();
  const { trackerValues, loading: valuesLoading } = useTrackerValues(
    valuesContext
  );

  return (
    <>
      <View style={styles.pillarsTile}>
        <View style={styles.pillarsTileBackgroundContainer}>
          {background}
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
                            trackerDayValues
                          )
                      : undefined
                  }
                />
              );
            })}
        </View>
      </View>
    </>
  );
};

const defaultStyles = StyleSheet.create({
  pillarsTile: {
    position: 'relative',
    borderRadius: 14,
    elevation: 1,
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {
      height: 0,
      width: 2
    },
    shadowRadius: 13,
    overflow: 'hidden'
  },
  pillarsTileBackgroundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 326
  },
  pillarsTileLoadingIndicator: {
    height: '100%',
    justifyContent: 'center'
  }
});

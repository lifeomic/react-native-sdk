import React, { FC } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgProps } from 'react-native-svg';
import { convertToPreferredUnit } from '../util/convert-value';
import { tID } from '../common/testID';
import {
  Tracker as TrackerType,
  TrackerValues,
} from '../services/TrackTileService';
import { StylesProp, useStyleOverrides } from '../styles';
import { Tracker } from './Tracker';

type TrackerRowProps = {
  loading: boolean;
  trackers: TrackerType[];
  values: TrackerValues[string];
  onOpenTracker: (metric: TrackerType) => void;
  icons?: Record<string, React.ComponentType<SvgProps>>;
};

export const TrackerRow: FC<TrackerRowProps> = (props) => {
  const { loading, trackers, values, onOpenTracker, icons } = props;

  const styles = useStyleOverrides(defaultStyles);

  return (
    <ScrollView
      horizontal
      scrollEnabled={true}
      contentContainerStyle={styles.trackerRowContainer}
    >
      {loading && (
        <View style={styles.trackerRowLoadingIndicator}>
          <ActivityIndicator
            testID={tID('trackers-loading')}
            accessibilityRole="progressbar"
            size="large"
          />
        </View>
      )}
      {!loading &&
        trackers.map((tracker) => (
          <TouchableOpacity
            testID={tID(
              `open-tracker-details-button-${tracker.metricId || tracker.id}`,
            )}
            key={tracker.metricId}
            onPress={() => onOpenTracker(tracker)}
            activeOpacity={0.5}
          >
            <Tracker
              {...tracker}
              icons={icons}
              value={convertToPreferredUnit(
                values[tracker.metricId ?? '']?.reduce(
                  (total, { value }) => total + value,
                  0,
                ),
                tracker,
              )}
            />
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
};

declare module '../TrackTile' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  trackerRowLoadingIndicator: {
    height: 131,
    paddingHorizontal: 16,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  trackerRowContainer: {
    minWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
});

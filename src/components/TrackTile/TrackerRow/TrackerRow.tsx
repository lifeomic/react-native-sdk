import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { tID } from '../common/testID';
import {
  Tracker as TrackerType,
  TrackerValues,
} from '../services/TrackTileService';
import { createStyles } from '../../BrandConfigProvider';
import { Tracker } from './Tracker';
import { useStyles } from '../../../hooks/useStyles';

type TrackerRowProps = {
  loading: boolean;
  trackers: TrackerType[];
  values: TrackerValues[string];
  onOpenTracker: (metric: TrackerType) => void;
  styles?: TrackRowStyles;
};

export function TrackerRow(props: TrackerRowProps) {
  const {
    loading,
    trackers,
    values,
    onOpenTracker,
    styles: instanceStyles,
  } = props;
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <ScrollView
      horizontal
      scrollEnabled={true}
      contentContainerStyle={styles.trackerRowContainer}
      showsHorizontalScrollIndicator={false}
    >
      {loading && (
        <View style={styles.trackerRowLoadingIndicatorView}>
          <ActivityIndicator
            testID={tID('trackers-loading')}
            accessibilityRole="progressbar"
            size="large"
          />
        </View>
      )}
      {!loading &&
        trackers.map(
          (tracker, i) =>
            tracker.installed && (
              <TouchableOpacity
                testID={tID(
                  `open-tracker-details-button-${
                    tracker.metricId || tracker.id
                  }`,
                )}
                key={i}
                onPress={() => onOpenTracker(tracker)}
                activeOpacity={0.5}
              >
                <Tracker
                  {...tracker}
                  value={
                    values[tracker.metricId ?? '']?.reduce(
                      (total, { value }) => total + value,
                      0,
                    ) ?? 0
                  }
                />
              </TouchableOpacity>
            ),
        )}
    </ScrollView>
  );
}

const defaultStyles = createStyles('TrackerRow', (theme) => ({
  trackerRowLoadingIndicatorView: {
    height: 131,
    paddingHorizontal: theme.spacing.medium,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  trackerRowContainer: {
    minWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackRowStyles = NamedStylesProp<typeof defaultStyles>;

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
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
import { createStyles } from '../../BrandConfigProvider';
import { Tracker } from './Tracker';
import { useStyles } from '../../../hooks/useStyles';

type TrackerRowProps = {
  loading: boolean;
  trackers: TrackerType[];
  values: TrackerValues[string];
  onOpenTracker: (metric: TrackerType) => void;
  icons?: Record<string, React.ComponentType<SvgProps>>;
  styles?: TrackRowStyles;
};

export function TrackerRow(props: TrackerRowProps) {
  const {
    loading,
    trackers,
    values,
    onOpenTracker,
    icons,
    styles: instanceStyles,
  } = props;
  const { styles } = useStyles(defaultStyles, instanceStyles);

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
        trackers.map((tracker, i) => (
          <TouchableOpacity
            testID={tID(
              `open-tracker-details-button-${tracker.metricId || tracker.id}`,
            )}
            key={i}
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
}

const defaultStyles = createStyles('TrackerRowx', (theme) => ({
  trackerRowLoadingIndicator: {
    height: 131,
    paddingHorizontal: theme.spacing.medium,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  trackerRowContainer: {
    minWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.extraSmall,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackRowStyles = NamedStylesProp<typeof defaultStyles>;

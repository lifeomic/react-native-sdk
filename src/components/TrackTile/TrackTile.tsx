import React, { FC, ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import TileBackground from './TileBackground';
import OpenSettingsButton from './OpenSettingsButton';
import { NamedStyles, StylesProp, useStyleOverrides } from './styles';
import { TrackerRow } from './TrackerRow/TrackerRow';
import {
  Tracker,
  TrackerValuesContext,
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM
} from './services/TrackTileService';
import { useTrackers } from './hooks/useTrackers';
import { useTrackerValues } from './hooks/useTrackerValues';
import { SvgProps } from 'react-native-svg';

export interface Styles extends NamedStyles, StylesProp<typeof defaultStyles> {}
export type TrackTileProps = {
  title?: string;
  background?: ReactNode;
  onOpenSettings: (valuesContext: TrackerValuesContext) => void;
  onOpenTracker: (metric: Tracker, valuesContext: TrackerValuesContext) => void;
  hideSettingsButton?: boolean;
  icons?: Record<string, React.ComponentType<SvgProps>>;
};

export const TrackTile: FC<TrackTileProps> = ({
  onOpenSettings,
  onOpenTracker,
  hideSettingsButton = false,
  title = '',
  background = <TileBackground />,
  icons
}) => {
  const styles = useStyleOverrides(defaultStyles);
  const valuesContext: TrackerValuesContext = {
    system: TRACKER_CODE_SYSTEM,
    codeBelow: TRACKER_CODE
  };

  const { trackers, loading: trackersLoading } = useTrackers();
  const { trackerValues, loading: valuesLoading } = useTrackerValues(
    valuesContext
  );

  return (
    <>
      <View style={styles.trackTile}>
        <View style={styles.trackTileBackgroundContainer}>
          {background}
          <View style={styles.trackTileHeader}>
            <Text style={styles.trackTileHeaderTitle}>{title}</Text>
            {!hideSettingsButton && (
              <OpenSettingsButton
                onPress={() => onOpenSettings(valuesContext)}
              />
            )}
          </View>
          <TrackerRow
            onOpenTracker={(tracker) => onOpenTracker(tracker, valuesContext)}
            trackers={trackers}
            values={trackerValues[0]}
            loading={trackersLoading || valuesLoading}
            icons={icons}
          />
        </View>
      </View>
    </>
  );
};

const defaultStyles = StyleSheet.create({
  trackTile: {
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
    shadowRadius: 13
  },
  trackTileBackgroundContainer: {
    alignSelf: 'center',
    width: '100%',
    overflow: 'hidden'
  },
  trackTileHeader: {
    height: 40,
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 8
  },
  trackTileHeaderTitle: {
    position: 'absolute',
    fontWeight: 'bold',
    left: 0,
    right: 0,
    alignSelf: 'center',
    textAlign: 'center',
    color: '#fff'
  }
});

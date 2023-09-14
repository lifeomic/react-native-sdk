import React, { useCallback } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/types';
import { createStyles } from '../components/BrandConfigProvider';
import { useDeveloperConfig, useStyles } from '../hooks';
import { ActivityIndicator } from 'react-native-paper';
import { useTrackers } from '../components/TrackTile/hooks/useTrackers';
import { RadialProgress } from '../components/TrackTile/TrackerRow/RadialProgress';
import {
  TRACKER_CODE,
  TRACKER_CODE_SYSTEM,
  type Tracker,
  type TrackerValuesContext,
} from '../components/TrackTile/services/TrackTileService';
import { useTrackerValues } from '../components/TrackTile/hooks/useTrackerValues';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import { Tile } from '../components/tiles/Tile';
import { ScreenSurface } from '../components/ScreenSurface';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home/MyProducts'>;

export const MyProductsScreen = ({ navigation }: Props) => {
  const { trackers, loading: trackersLoading } = useTrackers();
  const { styles } = useStyles(defaultStyles);
  const { componentProps } = useDeveloperConfig();
  const {
    radialProgressStrokeWidth,
    radialProgressRadius,
    radialProgressStrokeLinecap,
    radialProgressRotation,
  } = componentProps?.TrackerDetails || {};

  const valuesContext: TrackerValuesContext = {
    system: TRACKER_CODE_SYSTEM,
    codeBelow: TRACKER_CODE,
    shouldUseOntology: false,
  };

  const {
    trackerValues: [activeValues],
  } = useTrackerValues(valuesContext, {
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });

  const getIncomingValue = useCallback(
    (metricId: string) =>
      (activeValues[metricId] ?? []).reduce(
        (total, { value }) => total + value,
        0,
      ),
    [activeValues],
  );

  const renderRadial = useCallback(
    (tracker: Tracker) => (
      <View style={styles.radialView}>
        <RadialProgress
          disabled={false}
          color={tracker.color}
          target={tracker.target ?? 0}
          value={getIncomingValue(tracker.metricId ?? '')}
          strokeLinecap={radialProgressStrokeLinecap}
          rotation={radialProgressRotation}
          styles={{
            circle: {
              radius: radialProgressRadius,
              strokeWidth: radialProgressStrokeWidth,
            },
          }}
        />
      </View>
    ),
    [
      getIncomingValue,
      radialProgressRadius,
      radialProgressRotation,
      radialProgressStrokeLinecap,
      radialProgressStrokeWidth,
      styles.radialView,
    ],
  );

  if (trackersLoading) {
    return <ActivityIndicator />;
  }

  return (
    <ScreenSurface testID="my-products-screen">
      <View style={styles.rootView}>
        <View style={styles.tilesView}>
          {trackers?.map((tracker) => (
            <Tile
              id={tracker.id}
              key={tracker.id}
              title={tracker.name}
              onPress={() =>
                navigation.navigate('Home/TrackTile', {
                  tracker,
                  valuesContext,
                })
              }
              Icon={() => renderRadial(tracker)}
            />
          ))}
        </View>
      </View>
    </ScreenSurface>
  );
};

const defaultStyles = createStyles('MyProductsScreen', (theme) => ({
  rootView: {},
  tilesView: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  listSectionView: {},
  listItemView: { marginLeft: 30, marginVertical: 10 },
  radialView: { width: 30, height: 30 },
  titleText: {
    ...theme.fonts.titleMedium,
    color: theme.colors.text,
    maxWidth: '80%',
  },
  dividerView: { borderWidth: 0.5 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

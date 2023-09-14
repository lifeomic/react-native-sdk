import React, { useCallback } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigators/types';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { useDeveloperConfig, useStyles } from '../hooks';
import { ActivityIndicator, Divider, List } from 'react-native-paper';
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
import { TouchableOpacity } from 'react-native-gesture-handler';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home/MyProducts'>;

export const MyProductsScreen = ({ navigation }: Props) => {
  //   const { tracker, valuesContext, referenceDate } = params;
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

  const { ChevronRight } = useIcons();

  const renderRadial = useCallback(
    (tracker: Tracker) => (
      <View style={styles.radialView}>
        <RadialProgress
          disabled={false}
          color={tracker.color}
          target={tracker.target ?? 0}
          value={getIncomingValue(tracker.metricId ?? '')}
          strokeWidth={radialProgressStrokeWidth}
          radius={radialProgressRadius}
          strokeLinecap={radialProgressStrokeLinecap}
          rotation={radialProgressRotation}
          styles={{
            borderView: styles.radialProgressBorderView,
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
      styles.radialProgressBorderView,
      styles.radialView,
    ],
  );

  const renderIcon = useCallback(() => <ChevronRight />, [ChevronRight]);

  if (trackersLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.rootView}>
      {trackers?.map((tracker) => (
        <>
          <Divider style={styles.dividerView} />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Home/TrackTile', { tracker, valuesContext });
            }}
          >
            <List.Section style={styles.listSectionView}>
              <List.Item
                style={styles.listItemView}
                id={tracker.id}
                key={tracker.id}
                title={tracker.name}
                titleStyle={styles.titleText}
                left={() => renderRadial(tracker)}
                right={() => renderIcon()}
              />
            </List.Section>
          </TouchableOpacity>
        </>
      ))}
    </View>
  );
};

const defaultStyles = createStyles('MyProductsScreen', (theme) => ({
  rootView: {},
  listSectionView: {},
  listItemView: { marginLeft: 30, marginVertical: 10 },
  radialView: { width: 30, height: 30 },
  radialProgressBorderView: {},
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

export default MyProductsScreen;

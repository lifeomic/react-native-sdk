import React, { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
import { NamedStyles, StylesProp } from '../styles';
import { Pillar } from './Pillar';
import { Card } from 'react-native-paper';
import { createStyles } from '../../../components/BrandConfigProvider';
import { useStyles } from '../../../hooks/useStyles';

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
  styles?: PillarsTileStyles;
};

export const PillarsTile = ({
  onOpenDetails,
  onSaveNewValueOverride,
  icons,
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

const defaultStyles = createStyles('PillarsTile', (theme) => ({
  pillarsTile: {
    overflow: 'hidden',
    marginHorizontal: theme.spacing.medium,
    backgroundColor: theme.colors.background,
  },
  pillarsTileBackgroundContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 395,
  },
  pillarsTileLoadingIndicator: {
    height: '100%',
    justifyContent: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type PillarsTileStyles = NamedStylesProp<typeof defaultStyles>;

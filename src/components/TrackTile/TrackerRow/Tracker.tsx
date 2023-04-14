import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import Indicator, { INDICATOR_HEIGHT } from '../icons/indicator';
import { Tracker as TrackerType } from '../services/TrackTileService';
import { StylesProp, useStyleOverrides, Text } from '../styles';
import { RadialProgress } from './RadialProgress';
import { t } from '../../../../lib/i18n';
import { useFlattenedStyles } from '../hooks/useFlattenedStyles';
import { tID } from '../common/testID';
import {
  convertToPreferredUnit,
  getPreferredUnitType,
} from '../util/convert-value';
import { numberFormatters } from '../formatters';
import { SvgProps } from 'react-native-svg';

type TrackerProps = TrackerType & {
  value?: number;
  icons?: Record<string, React.ComponentType<SvgProps>>;
};
const { numberFormat } = numberFormatters;
export const Tracker: FC<TrackerProps> = (tracker) => {
  const isInstalled = 'metricId' in tracker;
  const disabled = !isInstalled;
  const styles = useStyleOverrides(defaultStyles);
  const flatStyles = useFlattenedStyles(styles, [
    'trackerIconColor',
    'trackerIconInstalledHeight',
    'trackerIconInstalledUninstalledHeight',
  ]);

  const unit = getPreferredUnitType(tracker);
  const unitDisplay = unit?.display?.toLocaleLowerCase();

  const currentValue = convertToPreferredUnit(tracker.value ?? 0, tracker);
  const id = tracker.metricId || tracker.id;

  return (
    <View style={styles.tracker}>
      <View style={styles.trackerProgressContainer}>
        <View style={styles.trackerProgressBarContainer}>
          <RadialProgress
            disabled={disabled}
            color={tracker.color}
            target={tracker.target ?? 0}
            value={currentValue}
          />
        </View>
        <View style={[disabled && styles.trackerIconDisabled]}>
          <Indicator
            name={tracker.icon}
            color={flatStyles.trackerIconColor.color ?? tracker.color}
            CustomIcon={tracker.icons?.[id]}
            scale={
              (isInstalled
                ? flatStyles.trackerIconInstalledHeight.height
                : flatStyles.trackerIconInstalledUninstalledHeight.height) /
              INDICATOR_HEIGHT
            }
          />
        </View>
        {isInstalled && (
          <Text
            testID={tID(`tracker-value-${id}`)}
            variant="bold"
            style={styles.trackerCurrentValue}
          >
            {numberFormat(currentValue)}
          </Text>
        )}
      </View>
      <Text
        testID={tID(`tracker-name-${id}`)}
        variant="bold"
        style={[styles.trackerName, disabled && styles.trackerNameDisabled]}
      >
        {tracker.name}
      </Text>
      <Text testID={tID(`tracker-unit-${id}`)} style={[styles.trackerUnit]}>
        {isInstalled
          ? t('track-tile.unit-display', {
              defaultValue: '({{unit}})',
              unit: unitDisplay,
            })
          : t('track-tile.track-it', 'Track It!')}
      </Text>
    </View>
  );
};

declare module '../TrackTile' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}
const size = 70;
const defaultStyles = StyleSheet.create({
  trackerName: {
    fontSize: 12,
    color: 'white',
  },
  trackerNameDisabled: {
    color: '#7B8996',
  },
  trackerUnit: { fontSize: 10, color: '#7B8996' },
  trackerCurrentValue: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  tracker: {
    marginBottom: 24,
    marginHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
  },
  trackerProgressContainer: {
    width: size,
    height: size,
    marginBottom: 10.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  trackerIconDisabled: {
    opacity: 0.5,
  },
  trackerIconColor: {
    color: undefined,
  },
  trackerIconInstalledHeight: {
    height: 20,
  },
  trackerIconInstalledUninstalledHeight: {
    height: 25,
  },
  trackerProgressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

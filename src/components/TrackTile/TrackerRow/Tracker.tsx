import React from 'react';
import { View } from 'react-native';
import Indicator, { INDICATOR_HEIGHT } from '../icons/indicator';
import { Tracker as TrackerType } from '../services/TrackTileService';
import { Text } from '../styles';
import { RadialProgress } from './RadialProgress';
import { t } from '../../../../lib/i18n';
import { tID } from '../common/testID';
import {
  convertToPreferredUnit,
  getPreferredUnitType,
} from '../util/convert-value';
import { numberFormatters } from '../formatters';
import { createStyles } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks/useStyles';
import { useTheme } from '../../../hooks';

type TrackerProps = TrackerType & {
  value?: number;
  styles?: TrackerStyles;
};
const { numberFormat } = numberFormatters;
export function Tracker(tracker: TrackerProps) {
  const disabled = !tracker.installed;
  const { styles: instanceStyles } = tracker;
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const theme = useTheme();

  const unit = getPreferredUnitType(tracker);
  const unitDisplay = unit?.display?.toLocaleLowerCase();

  const currentValue = convertToPreferredUnit(tracker.value ?? 0, tracker);
  const id = tracker.metricId || tracker.id;

  const scale = tracker.installed
    ? styles.trackerIconInstalledHeightView?.height ?? 30
    : styles.trackerIconInstalledUninstalledHeightView?.height ?? 35;

  return (
    <View style={styles.trackerView}>
      <View style={styles.trackerProgressContainer}>
        <View style={styles.trackerProgressBarContainer}>
          <RadialProgress
            disabled={disabled}
            color={theme.colors.primarySource}
            target={tracker.target ?? 0}
            value={currentValue}
          />
        </View>
        <View style={[disabled && styles.trackerIconDisabled]}>
          <Indicator
            name={id}
            fallbackName={tracker.icon}
            color={(styles.trackerIconColorText?.color ?? tracker.color) as any}
            scale={(scale as number) / INDICATOR_HEIGHT}
          />
        </View>
        {tracker.installed && (
          <Text
            testID={tID(`tracker-value-${id}`)}
            variant="bold"
            style={styles.trackerCurrentValueText}
          >
            {numberFormat(currentValue)}
          </Text>
        )}
      </View>
      <Text
        testID={tID(`tracker-name-${id}`)}
        variant="bold"
        style={[
          styles.trackerNameText,
          disabled && styles.trackerNameDisabledText,
        ]}
      >
        {tracker.name}
      </Text>
      <Text testID={tID(`tracker-unit-${id}`)} style={[styles.trackerUnitText]}>
        {tracker.installed
          ? t('track-tile.unit-display', {
              defaultValue: '({{unit}})',
              unit: unitDisplay,
            })
          : t('track-tile.track-it', 'Track It!')}
      </Text>
    </View>
  );
}

const size = 95;
const defaultStyles = createStyles('Tracker', (theme) => ({
  trackerNameText: {},
  trackerNameDisabledText: {
    color: '#7B8996',
  },
  trackerUnitText: { fontSize: 10, color: '#7B8996' },
  trackerCurrentValueText: {
    fontSize: 24,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  trackerView: {
    marginHorizontal: 8,
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
  trackerIconColorText: {
    color: undefined,
  },
  trackerIconInstalledHeightView: {},
  trackerIconInstalledUninstalledHeightView: {},
  trackerProgressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TrackerStyles = NamedStylesProp<typeof defaultStyles>;

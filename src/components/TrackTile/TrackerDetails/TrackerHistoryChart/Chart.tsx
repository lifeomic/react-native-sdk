import React, { FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../../styles';
import { eachDayOfInterval, format, isToday } from 'date-fns';
import { t } from '../../../../../lib/i18n';
import Bar from './Bar';
import { tID } from '../../common/testID';
import { dateFormatters } from '../../formatters';
import { darkenHexColor } from '../../util/darken-hex-color';
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';
import { numberFormatters } from '../../formatters';

export type ChartProps = {
  color?: string;
  variant?: 'default' | 'flat';
  hasError?: boolean;
  loading?: boolean;
  target: number;
  values: number[];
  unit?: string;
  range: {
    start: Date;
    end: Date;
  };
};

const { shortWeekday } = dateFormatters;

export const Chart: FC<ChartProps> = (props) => {
  const { variant = 'default', color = '#02BFF1' } = props;
  const { loading, range, target, values, hasError, unit = '' } = props;
  const { styles } = useStyles(defaultStyles);
  const { numberFormatCompact } = numberFormatters;
  const days = eachDayOfInterval(range).reverse();
  const isDefault = variant === 'default';
  const isFlat = variant === 'flat';

  const variantStyles = isDefault
    ? {
        chartValueBar: styles.barDefaultView,
        chartYTitle: styles.defaultYAxisLabel,
      }
    : isFlat
    ? {
        chartValueBar: styles.barFlatView,
        chartYTitle: styles.flatYAxisLabel,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.labelsContainer}>
        {days.map((day, index) => (
          <View style={styles.labelContainer} key={`${day}-day-container`}>
            <Text
              testID={tID(`history-chart-y-axis-label-${index}`)}
              style={variantStyles?.chartYTitle}
              accessibilityLabel={t('track-tile.day-value-unit-display', {
                defaultValue: '{{day}}: {{value}} {{unit}}',
                day: format(day, 'iiii, MMMM do'),
                value: values[index],
                unit,
              })}
            >
              {shortWeekday(day)
                .toUpperCase()
                .slice(0, isFlat ? 1 : undefined)}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.barsContainer}>
        {days.map((day, index) => (
          <View
            style={variantStyles?.chartValueBar}
            key={`${day}-bar-container`}
          >
            {/* Active Bar */}
            {!loading && !hasError && (
              <Bar
                variant={variant}
                style={!isToday(day) ? { barFlatView: { opacity: 0.35 } } : {}}
                color={darkenHexColor(
                  color,
                  isToday(day) || isDefault ? 0 : 45,
                )}
                testID={tID(`history-chart-value-bar-${index}`)}
                percentComplete={
                  values[index] / target >= 1 ? 1 : values[index] / target
                }
                animated
              />
            )}
          </View>
        ))}
      </View>
      <View style={styles.valuesContainer}>
        {days.map((day, index) => (
          <View
            style={{ alignSelf: 'flex-end' }}
            key={`${day}-value-container`}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.valueText,
                { ...(values[index] >= target && { color: color }) },
              ]}
            >
              {numberFormatCompact(values[index])}
            </Text>
          </View>
        ))}
      </View>

      {loading && (
        <View style={styles.contentWrapper}>
          <View style={styles.contentView}>
            <ActivityIndicator
              testID={tID('history-chart-data-loading')}
              size="large"
              color={color}
            />
          </View>
        </View>
      )}

      {hasError && (
        <View style={styles.contentWrapper}>
          <View style={styles.contentView}>
            <Text variant="semibold" style={styles.errorText}>
              {t(
                'track-tile.could-not-load-your-data',
                'Could not load your data\nPlease try again later',
              )}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const defaultStyles = createStyles('Chart', (theme) => ({
  container: {
    flex: 1,
    position: 'relative',
    height: 280,
    flexDirection: 'row',
    marginLeft: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
  labelsContainer: {
    justifyContent: 'space-around',
    flexBasis: 40,
    paddingRight: 4,
  },
  valuesContainer: {
    justifyContent: 'space-around',
    flexGrow: 1,
    flexShrink: 0,
    paddingLeft: 10,
  },
  barsContainer: {
    flexBasis: '85%',
    justifyContent: 'space-around',
    flexShrink: 0.1,
    flexGrow: 1,
  },
  valueText: { textAlign: 'left', width: 30 },
  barDefaultView: {},
  barFlatView: {},
  contentView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    bottom: 0,
    flexDirection: 'column',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorText: {
    alignSelf: 'center',
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
    padding: 8,
    textAlign: 'center',
  },
  defaultYAxisLabel: {
    color: '#7B8996',
    fontSize: 12,
    letterSpacing: 0.5,
    textAlign: 'left',
  },
  flatYAxisLabel: {
    color: '#242536',
    fontSize: 12,
    textAlign: 'left',
  },
  labelContainer: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

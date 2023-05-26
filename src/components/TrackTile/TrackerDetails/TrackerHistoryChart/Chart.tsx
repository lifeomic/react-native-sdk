import React, { FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../../styles';
import { scaleLinear } from 'd3-scale';
import { eachDayOfInterval, format, isToday } from 'date-fns';
import { t } from '../../../../../lib/i18n';
import Bar from './Bar';
import { tID } from '../../common/testID';
import { dateFormatters } from '../../formatters';
import { darkenHexColor } from '../../util/darken-hex-color';
import { createStyles } from '../../../BrandConfigProvider';
import { useStyles } from '../../../../hooks';

export type ChartProps = {
  color?: string;
  variant?: 'default' | 'flat';
  hasError?: boolean;
  loading?: boolean;
  target?: number;
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

  const days = eachDayOfInterval(range);

  const max = Math.max(...values, target ?? 0);
  const desiredTicks = Math.min(max, 10);
  const scale = scaleLinear().domain([0, max]).range([0, desiredTicks]).nice();

  const ticks = scale.ticks(desiredTicks);
  const ticksMax = ticks[ticks.length - 1];
  const isDefault = variant === 'default';
  const isFlat = variant === 'flat';

  const variantStyles = isDefault
    ? {
        chartValueBar: styles.barDefault,
        chartYTitle: styles.defaultYAxisLabel,
      }
    : isFlat
    ? {
        chartValueBar: styles.barFlat,
        chartYTitle: styles.flatYAxisLabel,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {/* Foreground */}
      <ChartContent maxTick={ticksMax} hasXAxis={isDefault}>
        {days.map((day, index) => (
          <View key={index} style={styles.dataContainer}>
            <View style={styles.labelContainer}>
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
            <View style={styles.barContainer}>
              <View style={variantStyles?.chartValueBar}>
                {/* Active Bar */}
                {!loading && !hasError && (
                  <Bar
                    variant={variant}
                    style={!isToday(day) && isFlat ? { opacity: 0.35 } : {}}
                    color={darkenHexColor(
                      color,
                      isToday(day) || isDefault ? 0 : 45,
                    )}
                    testID={tID(`history-chart-value-bar-${index}`)}
                    percentComplete={values[index] / ticksMax}
                    animated
                  />
                )}
              </View>
            </View>
          </View>
        ))}
      </ChartContent>

      {loading && (
        <ChartContent maxTick={ticksMax} hasXAxis={isDefault}>
          <ActivityIndicator
            testID={tID('history-chart-data-loading')}
            size="large"
            color={color}
          />
        </ChartContent>
      )}

      {hasError && (
        <ChartContent maxTick={ticksMax} hasXAxis={isDefault}>
          <Text variant="semibold" style={styles.errorText}>
            {t(
              'track-tile.could-not-load-your-data',
              'Could not load your data\nPlease try again later',
            )}
          </Text>
        </ChartContent>
      )}
    </View>
  );
};

const ChartContent: FC<any> = ({ children }) => {
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.contentWrapper}>
      <View style={[styles.content]}>{children}</View>
    </View>
  );
};

const defaultStyles = createStyles('Chart', () => ({
  barDefault: {},
  barFlat: {},
  barContainer: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 21,
    justifyContent: 'center',
  },
  aboveBarValueText: {
    fontSize: 14,
    color: '#242536',
  },
  container: {
    flex: 1,
    position: 'relative',
    height: 280,
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    position: 'relative',
  },
  contentWrapper: {
    bottom: 0,
    flexDirection: 'column',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dataContainer: {
    marginHorizontal: 7,
    flex: 1,
    flexDirection: 'row',
  },
  errorText: {
    alignSelf: 'center',
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
    padding: 8,
    textAlign: 'center',
  },
  tick: {
    backgroundColor: '#EEF0F2',
    flex: 1,
    width: 1,
  },
  tickContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    position: 'absolute',
  },
  YAxisContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 26,
    position: 'relative',
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
  labelContainer: { width: 40, justifyContent: 'center' },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

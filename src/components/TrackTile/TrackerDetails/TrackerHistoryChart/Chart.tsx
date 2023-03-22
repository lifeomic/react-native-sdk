import React, { FC } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StylesProp, useStyleOverrides, Text } from '../../styles';
import { scaleLinear } from 'd3-scale';
import { eachDayOfInterval, format, isToday } from 'date-fns';
import i18n from '@i18n';
import Bar from './Bar';
import { tID } from '../../common/testID';
import { numberFormatters, dateFormatters } from '../../formatters';
import { darkenHexColor } from '../../util/darken-hex-color';

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

const { numberFormat } = numberFormatters;
const { shortWeekday } = dateFormatters;

export const Chart: FC<ChartProps> = (props) => {
  const { variant = 'default', color = '#02BFF1' } = props;
  const { loading, range, target, values, hasError, unit = '' } = props;
  const styles = useStyleOverrides(defaultStyles);

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
        chartValueBar: styles.chartValueBarDefault,
        chartXTitle: styles.chartXTitleDefault,
      }
    : isFlat
    ? {
        chartValueBar: styles.chartValueBarFlat,
        chartXTitle: styles.chartXTitleFlat,
      }
    : undefined;

  return (
    <View style={styles.chartContainer}>
      {/* Background */}
      {isDefault && (
        <View style={styles.chartXAxisContainer}>
          {ticks.map((tick) => (
            <View
              key={tick}
              style={[
                {
                  bottom: `${(tick / ticksMax) * 100}%`,
                },
                styles.chartTickContainer,
              ]}
            >
              {tick > 0 && (
                <>
                  <Text
                    testID={tID(`history-chart-y-axis-label-${tick}`)}
                    accessible={false}
                    style={styles.yTitle}
                  >
                    {numberFormat(tick)}
                  </Text>
                  {tick < ticksMax && <View style={styles.chartTick} />}
                </>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Foreground */}
      <ChartContent maxTick={ticksMax} hasXAxis={isDefault}>
        {days.map((day, index) => (
          <View key={index} style={styles.chartDataContainer}>
            <View style={styles.chartBarContainer}>
              {/* Background Bar */}
              {isDefault && <Bar percentComplete={1} />}

              <View style={variantStyles?.chartValueBar}>
                {/* Floating Value above Bar */}
                {isFlat && values[index] > 0 && (
                  <Text style={styles.chartBarFloatingValue}>
                    {values[index]}
                  </Text>
                )}

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
            <Text
              testID={tID(`history-chart-x-axis-label-${index}`)}
              style={variantStyles?.chartXTitle}
              accessibilityLabel={i18n.t('edc1e8aa2f80dc6b3be50d4e168e30e8', {
                defaultValue: '{{day}}: {{value}} {{unit}}',
                day: format(day, 'iiii, MMMM do'),
                value: values[index],
                unit,
                ns: 'track-tile-ui',
              })}
            >
              {shortWeekday(day)
                .toUpperCase()
                .slice(0, isFlat ? 1 : undefined)}
            </Text>
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
          <Text variant="semibold" style={styles.chartError}>
            {i18n.t('aa16bb8028cd4767568a48d382e64d0a', {
              defaultValue: 'Could not load your data\nPlease try again later',
              ns: 'track-tile-ui',
            })}
          </Text>
        </ChartContent>
      )}
    </View>
  );
};

const ChartContent: FC<any> = ({ children, maxTick, hasXAxis }) => {
  const styles = useStyleOverrides(defaultStyles);

  return (
    <View style={styles.chartContentWrapper}>
      {/* Use Max Tick Value as a spacer so the chart doesn't overlap the axis text */}
      {hasXAxis && (
        <Text
          style={[{ opacity: 0 }, styles.yTitle]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {maxTick}
        </Text>
      )}
      <View style={[styles.chartContentContainer]}>{children}</View>
    </View>
  );
};

declare module '../TrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  chartValueBarDefault: {
    alignItems: 'center',
    marginLeft: -7,
  },
  chartValueBarFlat: {
    alignItems: 'center',
    marginLeft: 3.5,
  },
  chartBarContainer: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    minWidth: 21,
  },
  chartBarFloatingValue: {
    fontSize: 14,
    color: '#242536',
  },
  chartContainer: {
    flex: 1,
    position: 'relative',
    height: 250,
  },
  chartContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
  },
  chartContentWrapper: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  chartDataContainer: {
    marginVertical: 7,
  },
  chartError: {
    alignSelf: 'center',
    color: '#7B8996',
    fontSize: 16,
    letterSpacing: 0.23,
    padding: 8,
    textAlign: 'center',
  },
  chartTick: {
    backgroundColor: '#EEF0F2',
    flex: 1,
    height: 1,
  },
  chartTickContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
  },
  chartXAxisContainer: {
    flex: 1,
    marginTop: 16,
    marginBottom: 26,
    position: 'relative',
  },
  chartXTitleDefault: {
    color: '#7B8996',
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 18,
    paddingTop: 11,
    textAlign: 'center',
  },
  chartXTitleFlat: {
    color: '#242536',
    fontSize: 12,
    paddingTop: 12,
    textAlign: 'center',
  },
  yTitle: {
    color: '#7B8996',
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 18,
    paddingRight: 7,
    textAlign: 'center',
  },
});

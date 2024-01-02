import React, { useMemo } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory-native';
import { VictoryLabelProps } from 'victory-core';
import {
  eachDayOfInterval,
  format,
  eachMonthOfInterval,
  differenceInMinutes,
  differenceInDays,
  startOfDay,
  startOfMonth,
  isValid,
} from 'date-fns';
import groupBy from 'lodash/groupBy';
import { G, Circle, Text, SvgProps } from 'react-native-svg';
import { useCommonChartProps } from '../useCommonChartProps';
import type { SleepChartData } from './useSleepChartData';
import { useVictoryTheme } from '../useVictoryTheme';
import ViewShot from 'react-native-view-shot';
import { t } from 'i18next';
import { useStyles } from '../../../hooks';
import { createStyles } from '../../BrandConfigProvider';
import { View } from 'react-native';
import { ActivityIndicatorView } from '../../ActivityIndicatorView';

type Props = SleepChartData & {
  domainPadding?: number;
  viewShotRef: React.RefObject<ViewShot>;
};

export const MultiDayChart = (props: Props) => {
  const { viewShotRef } = props;
  const { dateRange, sleepData, isFetching } = props;
  const common = useCommonChartProps();
  const theme = useVictoryTheme();
  const { styles } = useStyles(defaultStyles);
  const { domainPadding: domainPaddingIn = styles.data?.domainPadding } = props;

  const { isYear, ticks, data } = useMemo(() => {
    const isYearChart = differenceInDays(...dateRange) < -31;
    const ticksFromRange = isYearChart
      ? eachMonthOfInterval({ start: dateRange[0], end: dateRange[1] })
      : eachDayOfInterval({ start: dateRange[0], end: dateRange[1] });

    const groupFn = isYearChart ? startOfMonth : startOfDay;

    const groupedData = groupBy(sleepData, (d) =>
      groupFn(new Date(d.effectiveDateTime!)),
    );

    return {
      isYear: isYearChart,
      ticks: ticksFromRange,
      data: Object.entries(groupedData)
        .filter(([date]) => isValid(new Date(date)))
        .map(([date, d]) => {
          const duration =
            d.reduce(
              (total, observation) =>
                total +
                (!observation.valuePeriod?.end ||
                !observation.valuePeriod?.start
                  ? 0
                  : differenceInMinutes(
                      new Date(observation.valuePeriod.end),
                      new Date(observation.valuePeriod.start),
                    )),
              0,
            ) / (isYearChart ? d.length : 1);

          return {
            y: duration,
            x: new Date(date),
            hours: Math.floor(duration / 60),
            minutes: Math.round(duration % 60),
            isAverage: isYearChart,
            period: format(new Date(date), isYearChart ? 'MMMM' : 'MMMM d'),
          };
        }),
    };
  }, [dateRange, sleepData]);

  const { barWidth, domainPadding } = useMemo(() => {
    let padding = domainPaddingIn ?? 0;
    const width = (common.plotAreaWidth - padding) / (ticks.length * 2 - 1);
    return {
      domainPadding: domainPaddingIn ?? width,
      barWidth: width,
    };
  }, [ticks, common, domainPaddingIn]);

  const dependentTicks = useMemo(() => {
    let maxY = 12 * 60;
    const maxDataPoint = Math.max(...data.map((d) => d.y));
    if (maxDataPoint > 12 * 60 && maxDataPoint <= 16 * 60) {
      maxY = 16 * 60;
    } else if (maxDataPoint > 16 * 60) {
      maxY = 24 * 60;
    }

    return new Array(4).fill(0).map((_, i) => ((i + 1) * maxY) / 4);
  }, [data]);

  return (
    <View>
      <ViewShot ref={viewShotRef} options={{ format: 'png' }}>
        <VictoryChart
          {...common}
          domainPadding={{ x: domainPadding }}
          maxDomain={{ y: dependentTicks[dependentTicks.length - 1] }}
          minDomain={{ y: 0 }}
          domain={{ x: [ticks[0], ticks[ticks.length - 1]] as [Date, Date] }}
        >
          <VictoryAxis
            {...common}
            dependentAxis
            tickValues={dependentTicks}
            tickFormat={(v) => `${v / 60}h`}
            style={theme.sleepAnalysisTheme.dependentAxis}
          />

          <VictoryBar
            theme={theme}
            data={data}
            barWidth={barWidth}
            cornerRadius={barWidth / 2}
            labels={(label) => label}
            labelComponent={<A11yBarLabel />}
            style={{
              ...theme.bar?.style,
              data: {
                ...theme.bar?.style?.data,
                fill: styles.data?.color,
              },
            }}
          />

          <VictoryAxis
            {...common}
            tickValues={ticks}
            tickFormat={(v, i, a) =>
              i === 0 || i + 1 === a.length
                ? format(v, isYear ? 'MMM' : 'MM/dd')
                : ''
            }
            tickLabelComponent={<Tick />}
            style={theme.sleepAnalysisTheme.independentAxis}
          />
        </VictoryChart>
      </ViewShot>

      <View style={styles.loadingContainer}>
        <ActivityIndicatorView animating={isFetching} />
      </View>
    </View>
  );
};

type TickProps = { text?: string } & VictoryLabelProps;

const Tick = ({ text, ...props }: TickProps) => {
  const { styles } = useStyles(defaultStyles);
  return (
    <G {...(props as any)}>
      <Circle x={0} y={0} r={2} {...styles.tickDot} />
      <Text y={20}>{text}</Text>
    </G>
  );
};

const A11yBarLabel = (props: VictoryLabelProps & { datum?: any }) => {
  return (
    props.datum && (
      <View
        accessibilityLabel={
          props.datum.isAverage
            ? t(
                'sleep-analysis-stage-a11y-label',
                'Average of {{ hours }} hours and {{ minutes }} minutes of sleep for {{ period }}',
                props.datum,
              )
            : t(
                'sleep-analysis-stage-a11y-label',
                '{{ hours }} hours and {{ minutes }} minutes of sleep on {{ period }}',
                props.datum,
              )
        }
      />
    )
  );
};

const defaultStyles = createStyles('SleepAnalysisMultiDay', (theme) => ({
  data: {
    domainPadding: undefined as any as number,
    color: theme.colors.primary,
  },
  tickDot: {
    fill: theme.colors.backdrop,
    opacity: 0.4,
  } as SvgProps,
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

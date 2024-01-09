import React, { useCallback, useMemo } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory-native';
import { VictoryLabelProps } from 'victory-core';
import { BarProps } from 'victory-bar';
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
import { G, Circle, Text, SvgProps, Rect } from 'react-native-svg';
import { useCommonChartProps } from '../useCommonChartProps';
import type { SleepChartData } from './useSleepChartData';
import { useVictoryTheme } from '../useVictoryTheme';
import { DataSelector, SleepDataToolTipPreparer } from './DataSelector';
import ViewShot from 'react-native-view-shot';
import { t } from 'i18next';
import { useStyles } from '../../../hooks';
import { createStyles } from '../../BrandConfigProvider';
import { View } from 'react-native';
import { ActivityIndicatorView } from '../../ActivityIndicatorView';
import { scaleLinear } from 'd3-scale';
import { useSleepDisplay } from './useSleepDisplay';
import { ObservationComponent } from 'fhir/r3';

type Props = SleepChartData & {
  domainPadding?: number;
  viewShotRef: React.RefObject<ViewShot>;
  onBlockScrollChange: (shouldBlock: boolean) => void;
};

export const MultiDayChart = (props: Props) => {
  const { viewShotRef, onBlockScrollChange } = props;
  const { dateRange, sleepData, isFetching, xDomain } = props;
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

    const getDurationInMinutes = (obs: fhir3.Observation) => {
      if (
        obs.valueQuantity?.code === 'min' &&
        obs.valueQuantity?.system === 'http://unitsofmeasure.org'
      ) {
        return obs.valueQuantity.value ?? 0;
      } else if (obs.valuePeriod?.end && obs.valuePeriod?.start) {
        return differenceInMinutes(
          new Date(obs.valuePeriod.end),
          new Date(obs.valuePeriod.start),
        );
      }

      return 0;
    };

    return {
      isYear: isYearChart,
      ticks: ticksFromRange,
      data: Object.entries(groupedData)
        .filter(([date]) => isValid(new Date(date)))
        .map(([date, d]) => {
          const duration =
            d.reduce(
              (total, observation) => total + getDurationInMinutes(observation),
              0,
            ) / (isYearChart ? d.length : 1);

          return {
            y: duration,
            x: new Date(date),
            hours: Math.floor(duration / 60),
            minutes: Math.round(duration % 60),
            isAverage: isYearChart,
            period: format(new Date(date), isYearChart ? 'MMMM' : 'MMMM d'),
            components: d.flatMap((datum) => datum.component),
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

  const prepareTooltipData = useCallback<SleepDataToolTipPreparer>(
    (x) => {
      const domain = isYear ? [0, 11] : dateRange;
      const getDateValue = (d: Date) =>
        xDomainWithPadding(isYear ? d.getMonth() : d);

      const xDomainWithPadding = xDomain
        .copy()
        .range([domainPadding, xDomain.range()[1] - domainPadding])
        .domain(domain);

      const closestPoint = data.reduce(
        (closest, datum) =>
          Math.abs(getDateValue(datum.x) - x) <
          Math.abs(getDateValue(closest.x) - x)
            ? datum
            : closest,
        data[0],
      );

      return {
        color: styles.data?.color ?? '',
        header: closestPoint.period,
        title: t(
          'sleep-analysis-sleep-amount',
          '{{hours}}h {{minutes}}m',
          closestPoint,
        ),
        subtitle: isYear
          ? t('sleep-analysis-average-duration', 'Avg Duration')
          : t('sleep-analysis-sleep-duration', 'Sleep Duration'),
        x: getDateValue(closestPoint?.x),
        hideTooltip: !closestPoint?.y,
      };
    },
    [data, xDomain, dateRange, isYear, styles, domainPadding],
  );

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
            dataComponent={<SleepBar />}
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

      <DataSelector
        onBlockScrollChange={onBlockScrollChange}
        prepareTooltipData={prepareTooltipData}
      />
    </View>
  );
};

const SleepBar = (props: BarProps) => {
  const toDisplay = useSleepDisplay();
  const stages = {
    deep: 0,
    light: 0,
    rem: 0,
    awake: 0,
    default: 0,
  };
  let total = 0;

  props.datum.components.forEach((component: ObservationComponent) => {
    if (!component?.valuePeriod?.start || !component?.valuePeriod?.end) {
      return;
    }

    const cStart = Number(new Date(component.valuePeriod.start));
    const cEnd = Number(new Date(component.valuePeriod.end));
    const diff = cEnd - cStart;

    const display = toDisplay(component.code);

    stages[display.codeType] += diff;
    total += diff;
  });

  const scale = scaleLinear()
    .range([0, (props.y0 ?? 0) - (props.y ?? 0)])
    .domain([0, total]);

  let y = props.y ?? 0;

  return (
    <>
      {(['awake', 'rem', 'light', 'deep'] as const).map((codeType) => {
        const rY = y;
        const y0 = scale(stages[codeType]);
        y += y0;

        return (
          <Rect
            key={codeType}
            {...(props as any)}
            x={(props.x ?? 0) - ((props.barWidth as number) ?? 0) / 2}
            y={rY}
            width={props.barWidth}
            height={y0}
            fill={toDisplay(codeType).color}
          />
        );
      })}
    </>
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

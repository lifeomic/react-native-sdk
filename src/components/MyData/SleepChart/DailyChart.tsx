import React, { useCallback, useMemo } from 'react';
import { VictoryChart, VictoryAxis } from 'victory-native';
import { VictoryLabelProps, Tuple } from 'victory-core';
import {
  eachHourOfInterval,
  format,
  endOfMinute,
  startOfMinute,
  differenceInMinutes,
} from 'date-fns';
import { View } from 'react-native';
import { createStyles, useIcons } from '../../BrandConfigProvider';
import {
  ForeignObject,
  G,
  Circle,
  Rect,
  Text,
  SvgProps,
  CircleProps,
} from 'react-native-svg';
import { useCommonChartProps } from '../useCommonChartProps';
import uniqBy from 'lodash/unionBy';
import type { SleepChartData } from './useSleepChartData';
import { useSleepDisplay, valToName } from './useSleepDisplay';
import { DataSelector, SleepDataToolTipPreparer } from './DataSelector';
import ViewShot from 'react-native-view-shot';
import { t } from 'i18next';
import { useVictoryTheme } from '../useVictoryTheme';
import { useStyles } from '../../../hooks';
import orderBy from 'lodash/orderBy';
import { Falsey } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { ActivityIndicatorView } from '../../ActivityIndicatorView';

type Props = SleepChartData & {
  viewShotRef: React.RefObject<ViewShot>;
  onBlockScrollChange: (shouldBlock: boolean) => void;
};

export const DailyChart = (props: Props) => {
  const { viewShotRef, onBlockScrollChange } = props;
  const { xDomain, sleepData, isFetching } = props;
  const common = useCommonChartProps();
  const { sleepAnalysisTheme: theme } = useVictoryTheme();
  const { styles } = useStyles(defaultStyles);
  const toDisplay = useSleepDisplay(styles.stageColors);

  const yDomain = useMemo(
    () =>
      scaleLinear()
        .range([0, common.height - common.padding.bottom - common.padding.top])
        .domain([0, 4]),
    [common],
  );

  const data = useMemo(
    () =>
      orderBy(
        compact(
          sleepData
            .flatMap((d) =>
              d.component?.map((c, i) => ({ id: `${d.id}-${i}`, ...c })),
            )
            .map((d) => {
              if (!d?.valuePeriod?.start || !d?.valuePeriod?.end) {
                return undefined;
              }

              const display = toDisplay(d.code);

              const sleepType = display.num;
              const start = startOfMinute(new Date(d.valuePeriod.start));
              const end = endOfMinute(new Date(d.valuePeriod.end));

              return {
                ...d,
                x: xDomain(start),
                width: xDomain(end) - xDomain(start),
                y: yDomain(4 - sleepType) + common.padding.top,
                height: yDomain(sleepType),
                sleepType,
                fill: display.color,
                sleepTypeName: display.name,
                startTime: start.toLocaleTimeString(),
                durationInMinutes: Math.abs(differenceInMinutes(start, end)),
              };
            }),
        ),
        'sleepType',
        'asc',
      ),
    [sleepData, common, xDomain, yDomain, toDisplay],
  );

  const ticks = useMemo(() => {
    const [start, end] = xDomain.domain().sort((a, b) => Number(a) - Number(b));

    if (start === end) {
      return [];
    }

    return uniqBy([start, ...eachHourOfInterval({ start, end }), end], (v) =>
      v.toISOString(),
    );
  }, [xDomain]);

  const prepareTooltipData = useCallback<SleepDataToolTipPreparer>(
    (x) => {
      const closestPoint = orderBy(data, 'x').find(
        (datum) => datum.x <= x && datum.x + datum.width >= x,
      );

      return (
        closestPoint && {
          color: closestPoint.fill ?? '',
          header: format(xDomain.invert(x), 'h:mm aa'),
          title: closestPoint.sleepTypeName,
          subtitle: t('sleep-analysis-stage', 'Stage'),
        }
      );
    },
    [data, xDomain],
  );

  return (
    <View>
      <ViewShot ref={viewShotRef} options={{ format: 'png' }}>
        <VictoryChart
          {...common}
          domain={{
            y: yDomain.domain() as Tuple<number>,
            x: data.length ? (xDomain.domain() as Tuple<Date>) : undefined,
          }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={valToName}
            style={theme.dependentAxis}
          />

          <G x={common.padding.left}>
            {data.map((d) => (
              <Rect
                key={d.id}
                {...d}
                accessibilityLabel={t(
                  'sleep-analysis-stage-a11y-label',
                  '{{ durationInMinutes }} minutes of {{ sleepTypeName }} sleep starting at {{startTime}}',
                  d,
                )}
              />
            ))}
          </G>

          <VictoryAxis
            tickValues={data.length ? ticks : []}
            tickFormat={(v, i, a) => {
              const isFirstOrLast = i === 0 || i === a.length - 1;
              if (!data.length) {
                return ''; // hide tick labels
              } else if (isFirstOrLast) {
                return format(v, 'hh:mm aa');
              } else {
                return '*';
              }
            }}
            tickLabelComponent={<Tick />}
            style={theme.independentAxis}
          />
        </VictoryChart>
      </ViewShot>

      <View style={styles.loadingContainer}>
        <ActivityIndicatorView animating={isFetching} />
      </View>

      {data.length > 0 && (
        <DataSelector
          onBlockScrollChange={onBlockScrollChange}
          prepareTooltipData={prepareTooltipData}
        />
      )}
    </View>
  );
};

function compact<T>(arr: T[]): Exclude<T, Falsey>[] {
  return arr.filter((v) => !!v) as Exclude<T, Falsey>[];
}

type TickProps = {
  text?: string;
  index?: number;
} & VictoryLabelProps;

const Tick = ({ text, index, ...props }: TickProps) => {
  const { Moon, Sunrise } = useIcons();
  const { styles } = useStyles(defaultStyles);
  const Icon = index === 0 ? Moon : Sunrise;

  if (!text) {
    return null;
  }

  if (text === '*') {
    return (
      <Circle
        {...(props as any)}
        style={{ ...props.style, ...styles.tickDot }}
        r={2}
      />
    );
  }

  return (
    <G {...(props as any)} y={(props.y ?? 0) - 5}>
      <Circle {...styles.tickIconBackground} />
      <ForeignObject x={-7} y={-7} width={20} height={20}>
        <View style={{ width: 14, height: 14 }}>
          <Icon {...styles.tickIcon} />
        </View>
      </ForeignObject>
      <Text y={25}>{text}</Text>
    </G>
  );
};

const defaultStyles = createStyles('SleepAnalysisSingleDay', (theme) => ({
  tickDot: {
    fill: theme.colors.backdrop,
    opacity: 0.4,
  } as SvgProps,
  tickIcon: {
    color: theme.colors.onPrimary,
    width: '100%',
    height: '100%',
  } as SvgProps,
  tickIconBackground: {
    fill: theme.colors.primary,
    r: 10,
  } as CircleProps,
  /**
   * @deprecated Use SleepAnalysisDisplay to control the stage colors
   */
  stageColors: {
    awake: 'hotpink',
    deep: 'dodgerblue',
    light: 'deepskyblue',
    rem: 'deeppink',
    default: 'transparent',
  },
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

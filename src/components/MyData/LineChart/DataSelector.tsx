import React, { useCallback, useMemo } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import { useCommonChartProps } from '../useCommonChartProps';
import { eachDayOfInterval, format, isSameDay } from 'date-fns';
import { sortBy, pick, compact } from 'lodash';
import { PointData } from './useChartData';
import { G, Text, Circle, Rect, Svg, Line } from 'react-native-svg';
import { useStyles } from '../../../hooks';
import { defaultChartStyles } from '../styles';

type Props = {
  xDomain: [number, number];
  dateRange: [Date, Date];
  trace1: PointData[];
  trace2: PointData[];
  selection: Selection | undefined;
  onChange: (selection?: Selection) => void;
};

export type Selection = {
  date: Date;
  point1?: PointData & { domain: [number, number] };
  point2?: PointData & { domain: [number, number] };
  points: PointData[];
};

export const DataSelector = (props: Props) => {
  const { trace1, trace2, xDomain, selection, onChange } = props;
  const common = useCommonChartProps();

  const data = useMemo(
    () =>
      eachDayOfInterval({
        start: xDomain[0],
        end: xDomain[1],
      }).map((date) => ({ x: Number(date) })),
    [xDomain],
  );

  const chartDimensions = useMemo<ChartDimensions>(() => {
    const paddingHorizontal = common.padding.left + common.padding.right;
    const paddingVertical = common.padding.top + common.padding.bottom;
    const plotAreaWidth = common.width - paddingHorizontal;

    return {
      chart: {
        ...pick(common, 'height', 'width'),
        paddingTop: common.padding.top,
        paddingRight: common.padding.right,
      },
      plotArea: {
        width: plotAreaWidth,
        height: common.height - paddingVertical,
      },
      barWidth: (plotAreaWidth + plotAreaWidth / data.length) / data.length,
    };
  }, [common, data]);

  const handleDataSelection = useCallback(
    (date: Date) => {
      const point1 = sortBy(
        trace1.filter((d) => isSameDay(new Date(d.x), date)),
        'x',
      )[0];
      const point2 = sortBy(
        trace2.filter((d) => isSameDay(new Date(d.x), date)),
        'x',
      )[0];

      if (!point1 && !point2) {
        return onChange(undefined);
      }

      const trace1Domain = domain(trace1, 'y');
      const trace2Domain = domain(trace2, 'y');

      onChange({
        date,
        points: compact([point1, point2]),
        point1: point1 && {
          ...point1,
          domain: trace1Domain,
        },
        point2: point2 && {
          ...point2,
          domain: trace2Domain,
        },
      });
    },
    [trace1, trace2, onChange],
  );

  const { barWidth } = chartDimensions;

  return (
    <>
      {selection && (
        <Svg
          width={common.width}
          height={common.height}
          style={{
            position: 'absolute',
            bottom: 0,
          }}
        >
          <G x={common.padding.left} y={common.padding.top}>
            <Tooltip
              selection={selection}
              dimensions={chartDimensions}
              xDomain={xDomain}
            />
          </G>
        </Svg>
      )}

      {data.map(({ x }, i) => (
        <TouchableWithoutFeedback
          key={x}
          onPress={() => handleDataSelection(new Date(x))}
          testID={`selection-bar-${i}`}
        >
          <View
            key={i}
            style={{
              position: 'absolute',
              top: common.padding.top / 2,
              bottom: common.padding.bottom / 2,
              left: common.padding.left + i * barWidth - barWidth / 2,
              width: barWidth,
            }}
          />
        </TouchableWithoutFeedback>
      ))}
    </>
  );
};

type ChartDimensions = {
  barWidth: number;
  plotArea: {
    height: number;
    width: number;
  };
};

type TooltipProps = {
  x?: number;
  y?: number;
  selection: Selection;
  dimensions: ChartDimensions;
  xDomain: [number, number];
};

const Tooltip = (props: TooltipProps) => {
  const { xDomain, dimensions, selection } = props;
  const { plotArea } = dimensions;
  const { point1: p1, point2: p2, date } = selection;
  const { styles } = useStyles(defaultChartStyles);
  const lineStyles = styles.dataSelectionTooltip?.line;

  let highestPoint = { ...p1 };
  let lowestPoint = { ...(p2 ?? p1) };

  const trace1Percent = calcPercentOfDomain(p1, 'y');
  const trace2Percent = calcPercentOfDomain(p2, 'y');

  if (!p1 || trace2Percent > trace1Percent) {
    lowestPoint = p1 ? highestPoint : lowestPoint;
    highestPoint = { ...p2 };
  }

  if (highestPoint?.domain?.[0] === highestPoint.domain?.[1]) {
    highestPoint.domain = [0, 1];
    highestPoint.y = 0.5;
    lowestPoint = highestPoint;
  }

  let x = plotArea.width * calcPercentOfDomain({ x: +date, domain: xDomain });

  if (xDomain[0] === xDomain[1]) {
    x = plotArea.width * 0.5;
  }

  const y1 = plotArea.height * (1 - calcPercentOfDomain(highestPoint, 'y'));
  const y2 = plotArea.height * (1 - calcPercentOfDomain(lowestPoint, 'y'));

  return (
    <>
      <Line x1={x} y1={y1} x2={x} y2={y2} {...lineStyles} />
      <CustomLabel {...props} x={x} y={y1} />
    </>
  );
};

const calcPercentOfDomain = (
  data?: Partial<PointData> & { domain?: [number, number] },
  dimension: 'x' | 'y' = 'x',
) => {
  const { domain = [0, 1], [dimension]: value = 0 } = data ?? {};
  return (value - domain[0]) / (domain[1] - domain[0]);
};

const domain = (points: PointData[], axis: 'x' | 'y') => {
  return [
    Math.min(...points.map((d) => d[axis])),
    Math.max(...points.map((d) => d[axis])),
  ] as [number, number];
};

const CustomLabel = (props: TooltipProps) => {
  const { selection, dimensions, x = 0, y = 0 } = props;
  const { plotArea } = dimensions;
  const common = useCommonChartProps();
  const { styles } = useStyles(defaultChartStyles);
  const { date, point1, point2 } = selection;
  const tooltipStyles = styles.dataSelectionTooltip ?? {};
  const { line } = tooltipStyles;
  const { offsetX = 0, offsetY = 0, height = 0, width = 0 } = tooltipStyles;

  const dateString = format(date, 'MMM dd');
  const decreaseBy = !point1 || !point2 ? 24 : 0;
  let connectorX2 = 0;
  let connectorY2 = offsetY;
  let yOffset = offsetY;
  let xOffset = offsetX;
  let isAngled = false;

  if (yOffset + y < 0) {
    isAngled = true;
    yOffset = 1;
    xOffset = Math.abs(offsetX ?? 0);
    connectorX2 = xOffset;
    connectorY2 = yOffset + height / 2;
  }

  const tooltipRightSideX = x + width + xOffset - decreaseBy;
  const maxX = plotArea.width + common.padding.right;
  if (tooltipRightSideX > maxX) {
    xOffset = -(width - decreaseBy) - xOffset;
    connectorX2 = isAngled ? -connectorX2 : connectorX2;
  }

  return (
    <G x={x} y={y}>
      {/* Connection Line */}
      <Line x2={connectorX2} y2={connectorY2 - common.padding.top} {...line} />

      {/* Tooltip Container */}
      <G
        x={xOffset}
        y={yOffset - common.padding.top}
        testID={`${dateString}-${compact([point1?.y, point2?.y]).join('-')}`}
      >
        {/* Background */}
        <Rect {...tooltipStyles} width={width - decreaseBy} height={height} />

        {/* Date Text */}
        <Text x={10} y={height / 2 + 4} fill={tooltipStyles.dateTextColor}>
          {dateString}
        </Text>

        {point1 && (
          <>
            <Circle
              x={65}
              y={height / 2}
              r={9}
              fill={point1.trace.color ?? styles.colors?.trace1}
            />
            <Text
              x={65}
              y={height / 2 + 4}
              textAnchor="middle"
              fill={tooltipStyles.bubble1TextColor}
              fontSize={
                Math.round(point1.y).toString().length > 2 ? 8 : undefined
              }
            >
              {Math.round(point1.y)}
            </Text>
          </>
        )}
        {point2 && (
          <>
            <Circle
              x={90 - decreaseBy}
              y={height / 2}
              r={9}
              fill={point2.trace.color ?? styles.colors?.trace2}
            />
            <Text
              x={90 - decreaseBy}
              y={height / 2 + 4}
              textAnchor="middle"
              fontSize={
                Math.round(point2.y).toString().length > 2 ? 8 : undefined
              }
              fill={tooltipStyles.bubble2TextColor}
            >
              {Math.round(point2.y)}
            </Text>
          </>
        )}
      </G>
    </G>
  );
};

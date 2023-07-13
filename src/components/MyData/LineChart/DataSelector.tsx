import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { VictoryBar } from 'victory-native';
import { useCommonChartProps } from '../useCommonChartProps';
import { eachDayOfInterval, format, isSameDay } from 'date-fns';
import { sortBy, compact } from 'lodash';
import { PointData } from './useChartData';
import { G, Text, Circle, Rect, Svg } from 'react-native-svg';
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
  chartWidth: number;
  point1: PointData;
  point2: PointData;
  points: PointData[];
  highestPointMeta: {
    point: PointData;
    domain: [number, number];
  };
};

export const DataSelector = (props: Props) => {
  const { trace1, trace2, xDomain, selection, onChange } = props;
  const { styles } = useStyles(defaultChartStyles);
  const common = useCommonChartProps();

  const handleDataSelection = useCallback(
    (date: Date, chartWidth: number) => {
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

      const trace1Domain = domain(trace1);
      const trace2Domain = domain(trace2);

      let highestPointMeta = {
        point: { ...point1 },
        domain: trace1Domain,
      };

      const trace1Percent =
        (point1?.y - trace1Domain[0]) / (trace1Domain[1] - trace1Domain[0]);
      const trace2Percent =
        (point2?.y - trace2Domain[0]) / (trace2Domain[1] - trace2Domain[0]);

      if (!point1 || trace2Percent > trace1Percent) {
        highestPointMeta = {
          point: { ...point2 },
          domain: trace2Domain,
        };
      }

      if (highestPointMeta.domain[0] === highestPointMeta.domain[1]) {
        highestPointMeta.domain = [0, 1];
        highestPointMeta.point.y = 0.5;
      }

      onChange({
        date,
        chartWidth,
        point1,
        point2,
        points: compact([point1, point2]),
        highestPointMeta,
      });
    },
    [trace1, trace2, onChange],
  );

  const data = useMemo(
    () =>
      eachDayOfInterval({
        start: xDomain[0],
        end: xDomain[1],
      }).map((date) => ({ x: Number(date), y: 1 })),
    [xDomain],
  );

  const paddingHorizontal = common.padding.left + common.padding.right;
  const chartWidth = common.width - paddingHorizontal;
  const barWidth = (chartWidth + chartWidth / data.length) / data.length;

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
          <VictoryBar
            {...common}
            domain={{ x: xDomain, y: selection.highestPointMeta.domain }}
            data={[selection.highestPointMeta.point]}
            labels={[selection.highestPointMeta.point.y]}
            labelComponent={<CustomLabel selection={selection} />}
            alignment="middle"
            barWidth={StyleSheet.hairlineWidth}
            style={{
              data: {
                fill: styles.dataSelectionTooltip?.lineColor,
              },
            }}
          />
        </Svg>
      )}

      {data.map(({ x }, i) => (
        <TouchableWithoutFeedback
          key={x}
          onPress={() => handleDataSelection(new Date(x), common.width)}
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

const domain = (points: PointData[]) => {
  return [
    Math.min(...points.map((d) => d.y)),
    Math.max(...points.map((d) => d.y)),
  ] as [number, number];
};

type CustomLabelProps = {
  x?: number;
  y?: number;
  selection: Selection;
  offsetY?: number;
  offsetX?: number;
  flagWidth?: number;
};

const CustomLabel = (props: CustomLabelProps) => {
  const { selection, x = 0, y = 0 } = props;
  const { offsetY = -25, offsetX = -12, flagWidth = 115 } = props;
  const { styles } = useStyles(defaultChartStyles);

  const decreaseBy = !selection.point1 || !selection.point2 ? 25 : 0;
  const shiftX = Math.min(
    selection.chartWidth - (x + flagWidth + offsetX - decreaseBy),
    0,
  );
  const dateString = format(selection.date, 'MMM dd');

  return (
    <G x={x + shiftX} y={y + offsetY}>
      <View
        testID={`${dateString}-${[selection.point1?.y, selection.point2?.y]
          .filter((data) => data)
          .join('-')}`}
      />
      <Rect
        x={-shiftX}
        y={0}
        height={-offsetY}
        strokeWidth={styles.dataSelectionTooltip?.lineWidth}
        stroke={styles.dataSelectionTooltip?.lineColor}
      />
      <Rect
        x={offsetX}
        y={-20}
        width={115 - decreaseBy}
        height={30}
        fill={styles.dataSelectionTooltip?.backgroundColor}
        stroke={styles.dataSelectionTooltip?.border}
        strokeWidth={styles.dataSelectionTooltip?.borderWidth}
      />
      <Text x={0} y={0} fill={styles.dataSelectionTooltip?.dateTextColor}>
        {dateString}
      </Text>
      {selection.point1 && (
        <>
          <Circle
            x={55}
            y={-5}
            r={9}
            fill={selection.point1.trace.color ?? styles.colors?.trace1}
          />
          <Text
            x={55}
            y={-4}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={styles.dataSelectionTooltip?.bubble1TextColor}
            fontSize={
              Math.round(selection.point1.y).toString().length > 2
                ? 8
                : undefined
            }
          >
            {Math.round(selection.point1.y)}
          </Text>
        </>
      )}
      {selection.point2 && (
        <>
          <Circle
            x={80 - decreaseBy}
            y={-5}
            r={9}
            fill={selection.point2.trace.color ?? styles.colors?.trace2}
          />
          <Text
            x={80 - decreaseBy}
            y={-4}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={
              Math.round(selection.point2.y).toString().length > 2
                ? 8
                : undefined
            }
            fill={styles.dataSelectionTooltip?.bubble2TextColor}
          >
            {Math.round(selection.point2.y)}
          </Text>
        </>
      )}
    </G>
  );
};

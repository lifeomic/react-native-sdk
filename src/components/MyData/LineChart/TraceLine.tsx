import React, { useMemo } from 'react';
import { VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { useVictoryTheme } from '../useVictoryTheme';
import { useCommonChartProps } from '../useCommonChartProps';
import { PointData } from './useChartData';
import { round, sumBy } from 'lodash';

export type Trace = {
  type: 'Observation';
  label: string;
  coding: Pick<fhir3.Coding, 'code' | 'system'>[];
  color?: string;
  showTrend?: boolean;
};

type Props = {
  trace: Trace;
  xDomain: [number, number];
  data: PointData[];
  variant?: 'trace1' | 'trace2';
};

export const TraceLine = (props: Props) => {
  const { trace, data, xDomain, variant = 'trace1' } = props;
  const { showTrend } = trace;
  const isTrace1 = variant === 'trace1';
  const common = useCommonChartProps();
  const theme = useVictoryTheme(trace, variant);

  const domainMax = Math.max(...data.map((v) => v.y));
  const domainMin = Math.min(...data.map((v) => v.y));
  const yDomain = [domainMin, domainMax] as [number, number];

  const trend = useMemo(() => {
    if (showTrend && data.length > 1) {
      const xAvg = sumBy(data, 'x') / data.length;
      const yAvg = sumBy(data, 'y') / data.length;
      const sumOfProducts = sumBy(data, (d) => (d.x - xAvg) * (d.y - yAvg));
      const sumOfSquares = sumBy(data, (d) => Math.pow(d.x - xAvg, 2));
      const m = sumOfProducts / sumOfSquares;
      const b = yAvg - m * xAvg;
      return [
        {
          x: xDomain[0],
          y: m * xDomain[0] + b,
        },
        {
          x: xDomain[1],
          y: m * xDomain[1] + b,
        },
      ];
    }

    return false;
  }, [showTrend, data, xDomain]);

  return (
    <>
      <VictoryAxis
        {...common}
        standalone={false}
        dependentAxis
        theme={theme}
        label={trace.label}
        maxDomain={domainMax}
        minDomain={domainMin}
        style={{
          tickLabels: {
            display: !data?.length ? 'none' : undefined,
          },
        }}
        tickCount={domainMax === domainMin ? 1 : undefined}
        tickFormat={(value) => round(value, 1)}
        orientation={isTrace1 ? 'left' : 'right'}
      />
      {!!data?.length && (
        <>
          {trend && (
            <VictoryLine
              {...common}
              domain={{ x: xDomain, y: yDomain }}
              standalone={false}
              data={trend}
              theme={theme.trendlineTheme}
            />
          )}
          <VictoryLine
            {...common}
            domain={{ x: xDomain }}
            standalone={false}
            data={data}
            theme={theme}
          />
          <VictoryScatter
            {...common}
            domain={{ x: xDomain }}
            standalone={false}
            data={data}
            theme={theme}
          />
        </>
      )}
    </>
  );
};

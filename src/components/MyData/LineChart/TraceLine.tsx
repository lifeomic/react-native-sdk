import React from 'react';
import { VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { useVictoryTheme } from '../useVictoryTheme';
import { useCommonChartProps } from '../useCommonChartProps';
import { PointData } from './useChartData';
import { round } from 'lodash';

export type Trace = {
  type: 'Observation';
  label: string;
  coding: Pick<fhir3.Coding, 'code' | 'system'>[];
  color?: string;
};

type Props = {
  trace: Trace;
  xDomain: [number, number];
  data: PointData[];
  variant?: 'trace1' | 'trace2';
};

export const TraceLine = (props: Props) => {
  const { trace, data, xDomain, variant = 'trace1' } = props;
  const isTrace1 = variant === 'trace1';
  const common = useCommonChartProps();
  const theme = useVictoryTheme(trace, variant);

  const domainMax = Math.max(...data.map((v) => v.y));
  const domainMin = Math.min(...data.map((v) => v.y));

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

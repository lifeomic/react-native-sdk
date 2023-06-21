import React from 'react';
import { VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { useVictoryTheme } from '../useVictoryTheme';
import { useCommonChartProps } from '../useCommonChartProps';
import { PointData } from './useChartData';
import { round } from 'lodash';

export type Trace = {
  type: 'Observation';
  label: string;
  code: Pick<fhir3.Coding, 'code' | 'system'>;
};

type Props = {
  trace: Trace;
  xDomain: [number, number];
  data: PointData[];
  variant?: 'primary' | 'secondary';
};

export const TraceLine = (props: Props) => {
  const { trace, data, xDomain, variant = 'primary' } = props;
  const isPrimary = variant === 'primary';
  const common = useCommonChartProps();
  const theme = useVictoryTheme(variant);

  if (!data?.length) {
    return null;
  }

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
        tickCount={domainMax === domainMin ? 1 : undefined}
        tickFormat={(value) => round(value, 1)}
        orientation={isPrimary ? 'left' : 'right'}
      />
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
  );
};

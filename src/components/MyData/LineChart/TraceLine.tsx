import React from 'react';
import { VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { useFhirClient } from '../../../hooks';
import { useVictoryTheme } from '../useVictoryTheme';
import { sortBy } from 'lodash';

export type Trace = {
  type: 'Observation';
  label: string;
  code: Pick<fhir3.Coding, 'code' | 'system'>;
};

type Props = {
  trace: Trace;
  dateRange: [Date, Date];
  variant?: 'primary' | 'secondary';
};

export const TraceLine = (props: Props) => {
  const { trace, dateRange, variant = 'primary' } = props;
  const isPrimary = variant === 'primary';
  const theme = useVictoryTheme(variant);
  const { useSearchResourcesQuery } = useFhirClient();
  const { data } = useSearchResourcesQuery({
    resourceType: trace.type,
    coding: [trace.code],
    dateRange,
  });

  const values = sortBy(
    data?.entry?.map((entry) => ({
      y: entry.resource?.valueQuantity?.value ?? 0,
      x: Number(new Date(entry.resource?.effectiveDateTime ?? '')),
      size: data.entry?.length === 1 ? 5 : undefined,
    })) ?? [],
    'x', // sort by date
  );

  if (!values?.length) {
    return null;
  }

  return (
    <>
      <VictoryAxis
        standalone={false}
        dependentAxis
        theme={theme}
        label={trace.label}
        domain={[
          Math.min(...values.map((v) => v.y)),
          Math.max(...values.map((v) => v.y)),
        ]}
        orientation={isPrimary ? 'left' : 'right'}
      />
      <VictoryLine standalone={false} data={values} theme={theme} />
      <VictoryScatter standalone={false} data={values} theme={theme} />
    </>
  );
};

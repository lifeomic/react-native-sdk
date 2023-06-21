import { sortBy } from 'lodash';
import { useFhirClient } from '../../../hooks';
import { Trace } from './TraceLine';
import { startOfDay } from 'date-fns';

type Props = {
  trace1: Trace;
  trace2?: Trace;
  dateRange: [Date, Date];
};

export const useChartData = (props: Props) => {
  const { trace1, trace2, dateRange } = props;
  const { useSearchResourcesQuery } = useFhirClient();

  const trace1Res = useSearchResourcesQuery({
    resourceType: trace1.type,
    coding: [trace1.code],
    dateRange,
  });

  const trace2Res = useSearchResourcesQuery({
    resourceType: trace2?.type ?? 'Observation',
    coding: [trace2?.code ?? {}],
    dateRange,
    enabled: !!trace2,
  });

  const trace1Data = sortBy(extractPointData(trace1Res), 'x');
  const trace2Data = sortBy(extractPointData(trace2Res), 'x');

  return {
    trace1Data,
    trace2Data,
  };
};

const extractPointData = ({
  data,
}: {
  data?: fhir3.Bundle<fhir3.Observation>;
}) =>
  data?.entry?.map((entry) => ({
    y: entry.resource?.valueQuantity?.value ?? 0,
    x: Number(startOfDay(new Date(entry.resource?.effectiveDateTime ?? ''))),
    size: data.entry?.length === 1 ? 5 : undefined, // TODO: Make size configurable
  })) ?? [];

export type PointData = ReturnType<typeof extractPointData>[number];

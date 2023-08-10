import { sortBy } from 'lodash';
import { useFhirClient } from '../../../hooks';
import { Trace } from './TraceLine';
import { startOfDay, differenceInDays } from 'date-fns';

type Props = {
  trace1: Trace;
  trace2?: Trace;
  dateRange: [Date, Date];
};

export const useChartData = (props: Props) => {
  const { trace1, trace2, dateRange } = props;
  const { useSearchResourcesQuery } = useFhirClient();

  const days = Math.abs(differenceInDays(...dateRange));

  const trace1Res = useSearchResourcesQuery({
    resourceType: trace1.type,
    coding: trace1.coding,
    dateRange,
    pageSize: Math.max(200, days),
  });

  const trace2Res = useSearchResourcesQuery({
    resourceType: trace2?.type ?? 'Observation',
    coding: trace2?.coding ?? [],
    dateRange,
    enabled: !!trace2,
    pageSize: Math.max(200, days),
  });

  const trace1Data = sortBy(extractPointData(trace1Res, trace1), 'x');
  const trace2Data = sortBy(extractPointData(trace2Res, trace2!), 'x');

  return {
    trace1Data,
    trace2Data,
  };
};

const extractPointData = (
  {
    data,
  }: {
    data?: fhir3.Bundle<fhir3.Observation>;
  },
  trace: Trace,
) =>
  data?.entry?.map((entry) => ({
    y: entry.resource?.valueQuantity?.value ?? 0,
    x: Number(startOfDay(new Date(entry.resource?.effectiveDateTime ?? ''))),
    size: data.entry?.length === 1 ? 5 : undefined, // TODO: Make size configurable
    trace,
  })) ?? [];

export type PointData = ReturnType<typeof extractPointData>[number];

import { useEffect, useState } from 'react';
import { useFhirClient } from '../../../hooks';
import { ScaleTime, scaleTime } from 'd3-scale';
import { differenceInDays, min, max, startOfDay, endOfDay } from 'date-fns';
import { useCommonChartProps } from '../useCommonChartProps';
import { Observation } from 'fhir/r3';
import compact from 'lodash/compact';
import groupBy from 'lodash/groupBy';

type Props = {
  dateRange: [Date, Date];
};

export type SleepChartData = ReturnType<typeof useSleepChartData>;

export const useSleepChartData = (props: Props) => {
  const { dateRange } = props;
  const { useSearchResourcesQuery } = useFhirClient();
  const common = useCommonChartProps();
  const [chartData, setChartData] = useState<{
    sleepData: Observation[];
    xDomain: ScaleTime<number, number>;
    dateRange: [Date, Date];
  }>({ sleepData: [], xDomain: scaleTime(), dateRange });
  const [isLoading, setIsLoading] = useState(true);

  const days = Math.abs(differenceInDays(...dateRange));

  const { data, isFetching, isFetched } = useSearchResourcesQuery({
    resourceType: 'Observation',
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '258158006',
      },
    ],
    dateRange: [startOfDay(dateRange[0]), endOfDay(dateRange[1])],
    pageSize: Math.max(50, days),
  });

  useEffect(() => {
    if (!isFetching && isFetched) {
      const sleepObservations =
        data?.entry
          ?.map((e) => e.resource)
          .filter((v): v is Observation => !!v) ?? [];

      const groupedData = groupBy(sleepObservations, (d) =>
        startOfDay(new Date(d.effectiveDateTime!)),
      );

      // Use only one observation per day, selecting the observation with the most
      // components since it should have the most detail
      const newSleepData = Object.values(groupedData).flatMap((entries) =>
        entries
          .sort(
            (a, b) => (b.component?.length || 0) - (a.component?.length || 0),
          )
          .slice(0, 1),
      );

      const { start, end } = newSleepData.reduce(
        (domain, observation) => ({
          start: min(
            compact([
              domain.start,
              observation.valuePeriod?.start &&
                new Date(observation.valuePeriod.start),
              ...(observation.component?.map(
                (c) => c.valuePeriod?.start && new Date(c.valuePeriod?.start),
              ) ?? []),
            ]),
          ),
          end: max(
            compact([
              domain.end,
              observation.valuePeriod?.end &&
                new Date(observation.valuePeriod.end),
              ...(observation.component?.map(
                (c) => c.valuePeriod?.end && new Date(c.valuePeriod?.end),
              ) ?? []),
            ]),
          ),
        }),
        {} as { start?: Date; end?: Date },
      );

      const newXDomain = scaleTime()
        .range([0, common.plotAreaWidth])
        .domain([new Date(start ?? 0), new Date(end ?? 0)]);

      setChartData({ sleepData: newSleepData, xDomain: newXDomain, dateRange });
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [common.plotAreaWidth, data, isFetching, isFetched, dateRange]);

  return {
    ...chartData,
    isFetching: isFetching || isLoading,
  };
};

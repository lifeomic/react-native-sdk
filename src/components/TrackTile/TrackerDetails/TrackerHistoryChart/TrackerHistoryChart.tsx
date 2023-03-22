import React, { FC, useState, useCallback, useEffect } from 'react';
import { useTrackerValues } from '../../hooks/useTrackerValues';
import { Chart, ChartProps } from './Chart';
import {
  endOfToday,
  startOfToday,
  addDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import Paginator from './Paginator';
import { convertToPreferredUnit } from '../../util/convert-value';
import { Tracker, TrackerValuesContext } from '../../services/TrackTileService';

type DateRangeType = 'past7Days' | 'calendarWeek';

type TrackerHistoryChartProps = {
  metricId: string;
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  target?: number;
  unit?: string;
  stepperPosition?: 'top' | 'bottom';
  dateRangeType?: DateRangeType;
} & Pick<ChartProps, 'variant' | 'color'>;

const getInitialRange = (dateRangeType: DateRangeType) => {
  switch (dateRangeType) {
    case 'calendarWeek':
      return {
        start: startOfWeek(startOfToday(), { weekStartsOn: 1 }),
        end: endOfWeek(startOfToday(), { weekStartsOn: 1 }),
      };
    case 'past7Days':
      return {
        start: addDays(startOfToday(), -6),
        end: endOfToday(),
      };
  }
};

export const TrackerHistoryChart: FC<TrackerHistoryChartProps> = (props) => {
  const { metricId, stepperPosition = 'top', tracker, valuesContext } = props;
  const { variant, target, unit, color, dateRangeType = 'past7Days' } = props;
  const [dateRange, setDateRange] = useState(getInitialRange(dateRangeType));
  const { loading, error, trackerValues } = useTrackerValues(
    valuesContext,
    dateRange,
  );

  useEffect(() => {
    setDateRange(getInitialRange(dateRangeType));
  }, [dateRangeType]);

  const advanceDays = useCallback(
    (shiftByDays: number) =>
      setDateRange(({ start, end }) => ({
        start: addDays(start, shiftByDays),
        end: addDays(end, shiftByDays),
      })),
    [],
  );

  const Stepper = (
    <Paginator color={color} range={dateRange} onChangeRange={advanceDays} />
  );

  return (
    <>
      {stepperPosition === 'top' && Stepper}
      <Chart
        variant={variant}
        color={color}
        loading={loading}
        range={dateRange}
        target={target}
        unit={unit}
        hasError={!!error}
        values={trackerValues.map((value) =>
          convertToPreferredUnit(
            value[metricId]?.reduce((total, { value }) => total + value, 0) ??
              0,
            tracker,
          ),
        )}
      />
      {stepperPosition === 'bottom' && Stepper}
    </>
  );
};

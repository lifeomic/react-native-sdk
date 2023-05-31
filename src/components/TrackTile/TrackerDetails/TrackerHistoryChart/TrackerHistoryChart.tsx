import React, { FC, useState, useCallback } from 'react';
import { useTrackerValues } from '../../hooks/useTrackerValues';
import { Chart, ChartProps } from './Chart';
import {
  startOfToday,
  addDays,
  startOfWeek,
  endOfWeek,
  endOfDay,
} from 'date-fns';
import { convertToPreferredUnit } from '../../util/convert-value';
import { Tracker, TrackerValuesContext } from '../../services/TrackTileService';
import { DateRangePicker } from '../DateRangePicker';

type DateRangeType = 'past7Days' | 'calendarWeek';

type TrackerHistoryChartProps = {
  metricId: string;
  tracker: Tracker;
  valuesContext: TrackerValuesContext;
  target: number;
  unit?: string;
  stepperPosition?: 'top' | 'bottom';
  dateRangeType?: DateRangeType;
  referenceDate?: Date;
} & Pick<ChartProps, 'variant' | 'color'>;

const getInitialRange = (dateRangeType: DateRangeType, referenceDate: Date) => {
  switch (dateRangeType) {
    case 'calendarWeek':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
      };
    case 'past7Days':
      return {
        start: addDays(referenceDate, -6),
        end: endOfDay(referenceDate),
      };
  }
};

export const TrackerHistoryChart: FC<TrackerHistoryChartProps> = (props) => {
  const {
    metricId,
    stepperPosition = 'bottom',
    tracker,
    valuesContext,
  } = props;
  const {
    variant,
    target,
    unit,
    dateRangeType = 'past7Days',
    referenceDate = startOfToday(),
  } = props;
  const [dateRange, setDateRange] = useState(
    getInitialRange(dateRangeType, referenceDate),
  );
  const { loading, error, trackerValues } = useTrackerValues(
    valuesContext,
    dateRange,
  );

  const advanceDays = useCallback(
    (shiftByDays: number) =>
      setDateRange(({ start, end }) => ({
        start: addDays(start, shiftByDays),
        end: addDays(end, shiftByDays),
      })),
    [],
  );

  const Stepper = (
    <DateRangePicker
      color={tracker.color}
      range={dateRange}
      onChangeRange={advanceDays}
    />
  );

  return (
    <>
      {stepperPosition === 'top' && Stepper}
      <Chart
        variant={variant}
        color={tracker.color}
        loading={loading}
        range={dateRange}
        target={target}
        unit={unit}
        hasError={!!error}
        values={trackerValues
          .map((value) =>
            convertToPreferredUnit(
              value[metricId]?.reduce((total, { value: v }) => total + v, 0) ??
                0,
              tracker,
            ),
          )
          .reverse()}
      />
      {stepperPosition === 'bottom' && Stepper}
    </>
  );
};

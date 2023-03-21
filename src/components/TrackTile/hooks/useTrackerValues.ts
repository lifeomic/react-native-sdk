import { useState, useEffect } from 'react';
import {
  TrackerValuesContext,
  TrackerValues,
  useTrackTileService
} from '../services/TrackTileService';
import {
  endOfToday,
  startOfToday,
  startOfDay,
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { notifier, EventTypeHandler } from '../services/EmitterService';
import _, { partition } from 'lodash';
import { usePrevious } from './usePrevious';

type ValuesChangedHandler = EventTypeHandler<'valuesChanged'>;

export const useTrackerValues = (
  valuesContext: TrackerValuesContext,
  dates?: { start: Date; end: Date }
) => {
  const defaultDateRange = { start: startOfToday(), end: endOfToday() };
  const dateRange = dates ?? defaultDateRange;
  const svc = useTrackTileService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | undefined>();
  const [today, setToday] = useState(() => startOfDay(new Date()));
  const [trackerValues, setTrackerValues] = useState<TrackerValues>();
  const prevDateRange = usePrevious(dateRange);
  const fetched = !!error || !!trackerValues;

  // Schedule Tracker Data Refetch at the start of tomorrow for default range
  useEffect(() => {
    if (fetched && !dates) {
      const intervalId = setInterval(() => {
        if (!isToday(today)) {
          setTrackerValues(undefined);
          setError(undefined);
          setToday(startOfDay(new Date()));
        }
      }, 60 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [fetched, dates, today]);

  useEffect(() => {
    const handler: ValuesChangedHandler = (updates) => {
      const relevantUpdates = updates.filter(
        (update) =>
          valuesContext.system === update.valuesContext.system &&
          valuesContext.codeBelow === update.valuesContext.codeBelow
      );

      if (!relevantUpdates.length) return;

      setTrackerValues((trackerValues = {}) => {
        return relevantUpdates.reduce((values, { metricId, tracker, drop }) => {
          const dateKey = startOfDay(
            tracker.createdDate || startOfToday()
          ).toUTCString();

          const [[currentValue], otherValues] = partition(
            values[dateKey]?.[metricId],
            (v) => v.id === tracker.id
          );

          return {
            ...values,
            [dateKey]: {
              ...values[dateKey],
              [metricId]: [...otherValues].concat(
                ...(drop ? [] : [{ ...currentValue, ...tracker }])
              )
            }
          };
        }, trackerValues);
      });
    };

    notifier.addListener('valuesChanged', handler);

    return () => {
      notifier.removeListener('valuesChanged', handler);
    };
  }, [valuesContext]);

  useEffect(() => {
    if (!loading && !_.isEqual(prevDateRange, dateRange)) {
      setLoading(true);

      svc
        .fetchTrackerValues(valuesContext, dateRange)
        .then((trackerValues) => {
          setTrackerValues(trackerValues);
          setLoading(false);
        })
        .catch((e) => {
          setError(e);
          setLoading(false);

          if (process.env.NODE_ENV === 'development') {
            throw e;
          }
        });
    }
  }, [svc.fetchTrackerValues, loading, dateRange, prevDateRange]);

  return {
    trackerValues: eachDayOfInterval(dateRange).map(
      (day) => trackerValues?.[day.toUTCString()] ?? {}
    ),
    loading,
    error
  };
};

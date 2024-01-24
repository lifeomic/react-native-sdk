import { useState, useEffect, useCallback } from 'react';
import {
  TrackerValuesContext,
  TrackerValues,
  useTrackTileService,
} from '../services/TrackTileService';
import {
  endOfToday,
  startOfToday,
  startOfDay,
  eachDayOfInterval,
  isToday,
} from 'date-fns';
import { notifier, EventTypeHandler } from '../services/EmitterService';
import _, { partition } from 'lodash';
import { usePrevious } from './usePrevious';
import {
  RefreshParams,
  refreshNotifier,
} from '../../../common/RefreshNotifier';

type ValuesChangedHandler = EventTypeHandler<'valuesChanged'>;

export const useTrackerValues = (
  valuesContext: TrackerValuesContext,
  dates?: { start: Date; end: Date },
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (valuesContext.shouldUseOntology) {
        // NOTE: The service uses ontology for values roll-up.  We don't need
        // to anything with the result here; we just need the service to fetch.
        await svc.fetchOntology(valuesContext.codeBelow);
      }
      const fetchedTrackerValues = await svc.fetchTrackerValues(
        valuesContext,
        dateRange,
      );
      setTrackerValues(fetchedTrackerValues);
      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);

      if (process.env.NODE_ENV === 'development') {
        throw e;
      }
    }
  }, [dateRange, svc, valuesContext]);

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
    const refreshHandler = (refreshParams: RefreshParams) => {
      if (refreshParams.context === 'HomeScreen') {
        fetchData();
      }
    };
    const { unsubscribe } = refreshNotifier.addListener(refreshHandler);
    return unsubscribe;
  }, [fetchData]);

  useEffect(() => {
    const handler: ValuesChangedHandler = (updates) => {
      const relevantUpdates = updates.filter(
        (update) =>
          valuesContext.system === update.valuesContext.system &&
          valuesContext.codeBelow === update.valuesContext.codeBelow,
      );

      if (!relevantUpdates.length) {
        return;
      }

      setTrackerValues((currentTrackerValues = {}) => {
        return relevantUpdates.reduce((values, { metricId, tracker, drop }) => {
          const dateKey = startOfDay(
            tracker.createdDate || startOfToday(),
          ).toUTCString();

          const [[currentValue], otherValues] = partition(
            values[dateKey]?.[metricId],
            (v) => v.id === tracker.id,
          );

          return {
            ...values,
            [dateKey]: {
              ...values[dateKey],
              [metricId]: [...otherValues].concat(
                ...(drop ? [] : [{ ...currentValue, ...tracker }]),
              ),
            },
          };
        }, currentTrackerValues);
      });
    };

    const { unsubscribe } = notifier.addListener('valuesChanged', handler);

    return unsubscribe;
  }, [valuesContext]);

  useEffect(() => {
    if (!loading && !_.isEqual(prevDateRange, dateRange)) {
      fetchData();
    }
  }, [
    svc.fetchTrackerValues,
    loading,
    dateRange,
    prevDateRange,
    svc,
    valuesContext,
    fetchData,
  ]);

  return {
    trackerValues: eachDayOfInterval(dateRange).map(
      (day) => trackerValues?.[day.toUTCString()] ?? {},
    ),
    loading,
    error,
  };
};

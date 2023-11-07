import { useEffect } from 'react';
import { Code, TrackerValue } from '../services/TrackTileService';
import { useStoredValue } from '../../../hooks/useStoredValue';
import { pick, uniqBy } from 'lodash';
import { EventTypeHandler, notifier } from '../services/EmitterService';

type ValuesChangedHandler = EventTypeHandler<'valuesChanged'>;

type CodedValue = {
  value: number;
  code: Code;
};

const toKey = (id: string) => `@lifeomic/track-tile/recent-values/${id}`;

export const useRecentCodedValues = (metricId: string): CodedValue[] => {
  const key = toKey(metricId);

  const [_recentCodedValues, _setRecentValues] = useStoredValue(key);

  useEffect(() => {
    const handler: ValuesChangedHandler = (updates) => {
      const relevantUpdates = updates.filter(
        ({ saveToRecent = true, tracker, drop }) =>
          saveToRecent && tracker?.code?.coding[0] && tracker.value && !drop,
      ) as { tracker: TrackerValue }[];

      _setRecentValues((_current) => {
        let current: CodedValue[] = JSON.parse(_current ?? '[]');

        current.unshift(
          ...relevantUpdates.map(({ tracker }) => ({
            value: tracker.value,
            code: pick(tracker.code.coding[0], ['code', 'system', 'display']),
          })),
        );

        current = uniqBy(
          current,
          ({ code }) => `${code.system}|${code.code}`,
        ).slice(0, 5);

        return JSON.stringify(current);
      });
    };

    notifier.addListener('valuesChanged', handler);

    return () => {
      notifier.removeListener('valuesChanged', handler);
    };
  }, [metricId, _setRecentValues]);

  return JSON.parse(_recentCodedValues ?? '[]');
};

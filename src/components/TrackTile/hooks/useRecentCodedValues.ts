import { useEffect, useState } from 'react';
import { Code, TrackerValue } from '../services/TrackTileService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pick, uniqBy } from 'lodash';
import { EventTypeHandler, notifier } from '../services/EmitterService';

type ValuesChangedHandler = EventTypeHandler<'valuesChanged'>;

type CodedValue = {
  value: number;
  code: Code;
};

const toKey = (id: string) => `@lifeomic/track-tile/recent-values/${id}`;

export const useRecentCodedValues = (metricId: string) => {
  const key = toKey(metricId);

  const [recentCodedValues, setRecentValues] = useState<CodedValue[]>([]);

  useEffect(() => {
    const getRecentValues = async () => {
      const data = await AsyncStorage.getItem(key);
      const recentValues = JSON.parse(data || '[]');
      setRecentValues(recentValues);
    };

    getRecentValues();
  }, [key]);

  useEffect(() => {
    const handler: ValuesChangedHandler = (updates) => {
      const relevantUpdates = updates.filter(
        ({ saveToRecent = true, tracker, drop }) =>
          saveToRecent && tracker?.code?.coding[0] && tracker.value && !drop,
      ) as { tracker: TrackerValue }[];

      setRecentValues((current) => {
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

        AsyncStorage.setItem(toKey(metricId), JSON.stringify(current));

        return current;
      });
    };

    const { unsubscribe } = notifier.addListener('valuesChanged', handler);

    return unsubscribe;
  }, [metricId]);

  return recentCodedValues;
};

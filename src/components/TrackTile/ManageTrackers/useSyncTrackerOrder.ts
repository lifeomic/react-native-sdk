import { useCallback, useState } from 'react';
import { notifier } from '../services/EmitterService';
import {
  Tracker,
  useTrackTileService,
  InstalledMetric,
  isInstalledMetric,
  extractBulkSettings,
} from '../services/TrackTileService';

export const useSyncTrackerOrder = (orderState: Tracker[] | undefined) => {
  const svc = useTrackTileService();
  const [hasError, setHasError] = useState<boolean>();
  const [loading, setLoading] = useState(false);

  const syncTrackerOrder = useCallback(async () => {
    if (!orderState) {
      return;
    }

    const toUpdate: InstalledMetric[] = [];
    const after = orderState.filter(isInstalledMetric);

    for (let index = after.length - 1; index >= 0; index--) {
      const tracker = after[index];
      const trackerOrder = tracker.order ?? Number.MAX_SAFE_INTEGER;

      if (trackerOrder !== index) {
        toUpdate.push({
          ...tracker,
          order: index,
        });
      }
    }

    if (!toUpdate.length) {
      return;
    }

    setLoading(true);

    try {
      await svc.upsertTrackers(toUpdate.map(extractBulkSettings));

      setHasError(false);
    } catch (e) {
      setHasError(true);

      if (process.env.NODE_ENV === 'development') {
        throw e;
      }
    }

    notifier.emit('trackerChanged', ...toUpdate);
    setLoading(false);
  }, [svc.upsertTracker, orderState]);

  return {
    syncTrackerOrder,
    hasError,
    loading,
  };
};

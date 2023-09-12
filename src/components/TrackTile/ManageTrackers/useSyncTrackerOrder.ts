import { useCallback, useState } from 'react';
import { notifier } from '../services/EmitterService';
import {
  Tracker,
  useTrackTileService,
  extractBulkSettings,
  InstalledMetric,
} from '../services/TrackTileService';
import { getPreferredUnitType } from '../util/convert-value';

export const useSyncTrackerOrder = (orderState: Tracker[] | undefined) => {
  const svc = useTrackTileService();
  const [hasError, setHasError] = useState<boolean>();
  const [loading, setLoading] = useState(false);

  const syncTrackerOrder = useCallback(async () => {
    if (!orderState?.length) {
      return;
    }

    const toUpdate: InstalledMetric[] = orderState.map((tracker, index) => {
      const unit = getPreferredUnitType(tracker);
      return {
        ...tracker,
        order: index,
        metricId: tracker.metricId ?? tracker.id,
        unit: tracker.unit ?? unit.unit,
        target: tracker.target ?? unit.target,
      };
    });

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
  }, [orderState, svc]);

  return {
    syncTrackerOrder,
    hasError,
    loading,
  };
};

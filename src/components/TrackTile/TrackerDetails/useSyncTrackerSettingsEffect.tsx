import { useCallback, useEffect, useRef } from 'react';
import {
  Tracker,
  InstalledMetricSettings,
  useTrackTileService,
  isInstalledMetric,
} from '../services/TrackTileService';
import { notifier } from '../services/EmitterService';

export const useSyncTrackerSettingsEffect = (
  tracker: Tracker,
  settings: Pick<InstalledMetricSettings, 'unit' | 'target'>,
) => {
  const { unit, target } = settings;
  const { order = Number.MAX_SAFE_INTEGER } = tracker;
  const metricId = tracker.metricId ?? tracker.id;
  const saveSettingsFnRef = useRef<() => void>();
  const svc = useTrackTileService();

  // Update the save function whenever the settings change
  saveSettingsFnRef.current = useCallback(() => {
    const updateSettings = async () => {
      if (metricId && (tracker.unit !== unit || tracker.target !== target)) {
        const updatedTracker = await svc.upsertTracker(metricId, {
          unit,
          target,
          order: isInstalledMetric(tracker) ? order : Number.MAX_SAFE_INTEGER,
        });

        notifier.emit('trackerChanged', { ...tracker, ...updatedTracker });
      }
    };

    updateSettings().catch(console.log);
  }, [svc, metricId, unit, target, tracker, order]);

  // Call the saveSettingsFn only on un mount
  useEffect(() => () => saveSettingsFnRef.current?.(), []);
};

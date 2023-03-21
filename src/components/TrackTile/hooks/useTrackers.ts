import { useEffect, useState } from 'react';
import { notifier } from '../services/EmitterService';
import {
  isInstalledMetric,
  Tracker,
  TRACKER_PILLAR_CODE_SYSTEM,
  useTrackTileService
} from '../services/TrackTileService';
import omit from 'lodash/omit';

export const useTrackers = () => {
  const svc = useTrackTileService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | undefined>();
  const [trackers, setTrackers] = useState<Tracker[]>();
  const [pillarTrackers, setPillarTrackers] = useState<Tracker[]>();
  const fetched = !!error || !!trackers;

  useEffect(() => {
    const onChange = (...trackers: Tracker[]) => {
      const installedMetrics = trackers.filter(isInstalledMetric);

      if (!installedMetrics.length) return;

      setTrackers((trackers) =>
        sortTrackers(
          trackers
            ?.filter(
              (t) =>
                !installedMetrics.find(
                  ({ id, metricId }) => t.id === id || t.id === metricId
                )
            )
            .concat(installedMetrics)
        )
      );
    };

    const onRemoved = (tracker: Tracker) => {
      if (isInstalledMetric(tracker)) {
        setTrackers((trackers) =>
          sortTrackers(
            trackers?.map((t) => {
              if (t.id === tracker.id) {
                return {
                  ...omit(t, ['target', 'unit', 'metricId']),
                  id: tracker.metricId
                };
              }
              return t;
            })
          )
        );
      }
    };

    notifier.addListener('trackerChanged', onChange);
    notifier.addListener('trackerRemoved', onRemoved);

    return () => {
      notifier.removeListener('trackerChanged', onChange);
      notifier.removeListener('trackerRemoved', onRemoved);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!fetched && !loading) {
        setLoading(true);

        try {
          const allTrackers = await svc.fetchTrackers();
          const pillarTileTrackers = allTrackers.filter(
            (t) => t.system === TRACKER_PILLAR_CODE_SYSTEM
          );
          const trackTileTrackers = allTrackers.filter(
            (t) => !pillarTileTrackers.includes(t)
          );

          setTrackers(sortTrackers(trackTileTrackers));
          setPillarTrackers(sortTrackers(pillarTileTrackers));
          setLoading(false);
        } catch (e) {
          setError(e?.error || e);
          setLoading(false);

          if (process.env.NODE_ENV === 'development') {
            throw e;
          }
        }
      }
    };

    fetchData();
  }, [svc.fetchTrackers, fetched, loading]);

  return {
    trackers: trackers ?? [],
    pillarTrackers: pillarTrackers ?? [],
    loading,
    error
  };
};

const sortTrackers = (trackers?: Tracker[]) => {
  return trackers?.sort((a, b) => {
    const aIsInstalled = 'metricId' in a;
    const bIsInstalled = 'metricId' in b;
    const aOrder = a.order ?? Infinity;
    const bOrder = b.order ?? Infinity;

    if (aIsInstalled && !bIsInstalled) return -1;
    if (bIsInstalled && !aIsInstalled) return 1;
    if (aOrder < bOrder) return -1;
    if (aOrder > bOrder) return 1;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;

    return 0;
  });
};

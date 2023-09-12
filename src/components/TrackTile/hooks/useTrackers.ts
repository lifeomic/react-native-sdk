import { useEffect, useState } from 'react';
import { notifier } from '../services/EmitterService';
import {
  Tracker,
  TRACKER_PILLAR_CODE_SYSTEM,
  useTrackTileService,
} from '../services/TrackTileService';

type Trackers = {
  trackers: Tracker[];
  pillarTrackers: Tracker[];
  loading: boolean;
  error?: any;
};

/**
 * Hook to fetch available trackers
 *
 * @param {Trackers} trackersToUse - Short-circuit the hooks to prevent
 * fetching trackers and return the inputted trackers
 *
 */
export const useTrackers = (trackersToUse?: Trackers) => {
  const svc = useTrackTileService();
  const [loading, setLoading] = useState(trackersToUse?.loading ?? false);
  const [error, setError] = useState<any | undefined>(trackersToUse?.error);
  const [trackers, setTrackers] = useState<Tracker[] | undefined>(
    trackersToUse?.trackers,
  );
  const [pillarTrackers, setPillarTrackers] = useState<Tracker[] | undefined>(
    trackersToUse?.pillarTrackers,
  );
  const fetched = !!error || !!trackers;

  useEffect(() => {
    const onChange = (...newTrackers: Tracker[]) => {
      if (!newTrackers.length) {
        return;
      }

      const pillarTileTrackers = newTrackers.filter(
        (t) => t.system === TRACKER_PILLAR_CODE_SYSTEM,
      );
      const trackTileTrackers = newTrackers.filter(
        (t) => !pillarTileTrackers.includes(t),
      );

      setTrackers((currentTrackers) =>
        sortTrackers(
          currentTrackers
            ?.filter(
              (t) =>
                !trackTileTrackers.find(
                  ({ id, metricId }) => t.id === id || t.id === metricId,
                ),
            )
            .concat(trackTileTrackers),
        ),
      );

      setPillarTrackers((currentTrackers) =>
        sortTrackers(
          currentTrackers
            ?.filter(
              (t) =>
                !pillarTileTrackers.find(
                  ({ id, metricId }) => t.id === id || t.id === metricId,
                ),
            )
            .concat(pillarTileTrackers),
        ),
      );
    };

    const onRemoved = (tracker: Tracker) => {
      if (tracker.system === TRACKER_PILLAR_CODE_SYSTEM) {
        setPillarTrackers((currentTrackers) =>
          sortTrackers(
            currentTrackers?.map((t) => {
              if (t.id === tracker.id) {
                return {
                  ...t,
                  installed: false,
                };
              }
              return t;
            }),
          ),
        );
      } else {
        setTrackers((currentTrackers) =>
          sortTrackers(
            currentTrackers?.map((t) => {
              if (t.id === tracker.id) {
                return {
                  ...t,
                  installed: false,
                };
              }
              return t;
            }),
          ),
        );
      }
    };
    if (!trackersToUse) {
      notifier.addListener('trackerChanged', onChange);
      notifier.addListener('trackerRemoved', onRemoved);

      return () => {
        notifier.removeListener('trackerChanged', onChange);
        notifier.removeListener('trackerRemoved', onRemoved);
      };
    }
  }, [trackersToUse]);

  useEffect(() => {
    const fetchData = async () => {
      if (!fetched && !loading) {
        setLoading(true);

        try {
          const allTrackers = await svc.fetchTrackers();
          const pillarTileTrackers = allTrackers.filter(
            (t) => t.system === TRACKER_PILLAR_CODE_SYSTEM,
          );
          const trackTileTrackers = allTrackers.filter(
            (t) => !pillarTileTrackers.includes(t),
          );

          setTrackers(sortTrackers(trackTileTrackers));
          setPillarTrackers(sortTrackers(pillarTileTrackers));
          setLoading(false);
        } catch (fetchError) {
          const e = fetchError as { error: unknown };
          setError(e?.error || e);
          setLoading(false);

          if (process.env.NODE_ENV === 'development') {
            throw e;
          }
        }
      }
    };
    if (!trackersToUse) {
      fetchData();
    }
  }, [svc.fetchTrackers, fetched, loading, svc, trackersToUse]);

  return {
    trackers: trackers ?? [],
    pillarTrackers: pillarTrackers ?? [],
    loading,
    error,
  };
};

const sortTrackers = (trackers?: Tracker[]) => {
  return trackers?.sort((a, b) => {
    const aIsInstalled = 'metricId' in a;
    const bIsInstalled = 'metricId' in b;
    const aOrder = a.order ?? Infinity;
    const bOrder = b.order ?? Infinity;

    if (aIsInstalled && !bIsInstalled) {
      return -1;
    }
    if (bIsInstalled && !aIsInstalled) {
      return 1;
    }
    if (aOrder < bOrder) {
      return -1;
    }
    if (aOrder > bOrder) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });
};

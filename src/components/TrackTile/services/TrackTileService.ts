import { pick } from 'lodash';
import { createContext, useContext } from 'react';

export type UnitType = {
  code: string;
  default: boolean;
  display: string;
  system: string;
  target: number;
  unit: string;
  increment?: number; // pillar increment
  stepAmount?: number; // edit value by amount
  quickAddAmount?: number; // value to add when using quick add
  displayZero?: string;
  displayOne?: string;
  displayTwo?: string;
  displayFew?: string;
  displayMany?: string;
  displayOther?: string;
};

export type MetricType = {
  account: string;
  color: string;
  description: string;
  icon: string;
  id: string;
  lifePoints: number;
  name: string;
  resourceType: 'Observation' | 'Procedure';
  units: UnitType[];
  code: string;
  system: string;
};

export type InstalledMetricSettings = Pick<UnitType, 'unit' | 'target'> & {
  order: number;
};

export type BulkInstalledMetricSettings = InstalledMetricSettings & {
  metricId: string;
};

export type InstalledMetric = MetricType &
  InstalledMetricSettings & {
    metricId: string;
  };

export type Tracker = MetricType & Partial<InstalledMetric>;

export type TrackerValue = {
  code: TrackerResource['code'];
  id: string;
  createdDate: Date;
  value: number;
};

/**
 * @description A map of dates, in UTC format at the start of the user's day, to a map of metricIds to _TrackerValue_ objects
 */
export type TrackerValues = Record<string, Record<string, TrackerValue[]>>;

/**
 * @description TrackerValues keyed by a values context key like system|key
 */
export type ContextTrackerValues = Record<string, TrackerValues>;

export type Code = {
  system: string;
  code: string;
  display: string;
  id?: string;
  educationContent?: {
    description?: string;
    thumbnail?: string;
    url?: string;
  };
};

export type TrackerResource = {
  id?: string;
  code: {
    coding: Code[];
  };
  meta: {
    tag: Array<{
      code: string;
      system: string;
    }>;
  };
  status: string;
} & (
  | {
      readonly resourceType: 'Observation';
      effectiveDateTime: string;
      valueQuantity: {
        value: number;
        unit: string;
        system: string;
        code: string;
      };
    }
  | {
      readonly resourceType: 'Procedure';
      performedPeriod: {
        start: string;
        end: string;
      };
    }
);

export type CodedRelationship = Code & {
  specializedBy: CodedRelationship[];
};

/**
 * @description A system and codeBelow, used for querying via codeBelow but
 * also for caching purposes. It should represent the tile/context under
 * which values should be fetched & cached.
 */
export type TrackerValuesContext = {
  system: string;
  codeBelow: string;
};

export const TRACK_TILE_CAPABILITIES_VERSION = 2;
export const TRACK_TILE_CAPABILITIES_VERSION_HEADER =
  'LifeOmic-TrackTile-Capabilities-Version';
export const TRACKER_CODE = 'f0ff8f26-eb4d-4322-9683-390c90aab83d';
export const TRACKER_CODE_SYSTEM = 'http://lifeomic.com/fhir/track-tile-value';
export const TRACKER_PILLAR_CODE = 'b7d1b3f4-89cd-4c11-9f00-024a9a7bd235';
export const TRACKER_PILLAR_CODE_SYSTEM =
  'http://lifeomic.com/fhir/track-tile-pillar-value';

export type TrackTileService = {
  /**
   * @description providing a patientId will tag the resources with the subject's id and query for data with the same id.
   */
  readonly patientId?: string;

  /**
   * @description account and project that the patient data will be saved to
   */
  readonly datastoreSettings: {
    readonly account: string;
    readonly project: string;
  };

  /**
   * @description account and project that is used for fetching tracker settings. Defaults to **datastoreSettings**
   */
  readonly accountSettings?: {
    readonly account: string;
    readonly project: string;
    /**
     * @description used to decide if public trackers should be fetched alongside account trackers
     */
    readonly includePublicTrackers: boolean;
  };

  fetchTrackers: (includePublic?: boolean) => Promise<Tracker[]>;
  upsertTracker: (
    metricId: string,
    settings: InstalledMetricSettings,
  ) => Promise<InstalledMetric>;
  upsertTrackers: (settings: BulkInstalledMetricSettings[]) => Promise<void>;
  uninstallTracker: (metricId: string) => Promise<void>;

  /**
   * @description NOTE: For Procedure resources, the TrackerValue `value` prop
   * MUST be returned as the duration (end-start) in seconds.
   */
  fetchTrackerValues: (
    valuesContext: TrackerValuesContext,
    dates: {
      start: Date;
      end: Date;
    },
  ) => Promise<TrackerValues>;

  upsertTrackerResource: (
    valuesContext: TrackerValuesContext,
    resource: TrackerResource,
  ) => Promise<TrackerValue>;

  deleteTrackerResource: (
    valuesContext: TrackerValuesContext,
    resourceType: Tracker['resourceType'],
    id: string,
  ) => Promise<boolean>;

  fetchOntology: (code: string) => Promise<CodedRelationship[]>;
};

export const TrackTileServiceContext = createContext<
  TrackTileService | undefined
>(undefined);

export const TrackTileServiceProvider =
  TrackTileServiceContext.Provider as React.Provider<TrackTileService>;

export const useTrackTileService = () => {
  const ctx = useContext(TrackTileServiceContext);

  if (!ctx) {
    throw new Error(
      'TrackTileService is undefined. Did you forget to provide one via TrackTileServiceProvider?',
    );
  }

  return ctx;
};

export const extractBulkSettings = (
  install: InstalledMetric,
): BulkInstalledMetricSettings =>
  pick(install, ['unit', 'order', 'target', 'metricId']);

export const isInstalledMetric = (
  tracker: Tracker,
): tracker is InstalledMetric => {
  return 'metricId' in tracker && 'target' in tracker && 'unit' in tracker;
};

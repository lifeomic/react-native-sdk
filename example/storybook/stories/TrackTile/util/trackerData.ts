import {
  Tracker,
  TRACKER_CODE_SYSTEM,
  TRACKER_PILLAR_CODE_SYSTEM,
} from '../../../../../src/components/TrackTile/services/TrackTileService';

export const getTrackers = ({
  names,
  pillars,
}: {
  names?: string[];
  pillars?: boolean;
} = {}) => {
  const availableTrackers = [
    nutrition,
    activity,
    mindfulness,
    sleep,
    school,
  ].map((tracker) => ({
    ...tracker,
    system: pillars ? TRACKER_PILLAR_CODE_SYSTEM : TRACKER_CODE_SYSTEM,
  }));

  return names
    ? availableTrackers.filter((tracker) => names.includes(tracker.name))
    : availableTrackers;
};

const baseTracker = {
  account: 'account-id',
  description: 'desc',
  lifePoints: 0,
  installed: true,
  system: TRACKER_CODE_SYSTEM,
};

export const nutrition: Tracker = {
  ...baseTracker,
  id: 'nutrition',
  metricId: 'nutrition',
  name: 'nutrition',
  icon: 'apple',
  color: '#33C317',
  resourceType: 'Observation',
  code: 'code',
  order: 1,
  units: [
    {
      code: 'nutrition',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      default: true,
      display: 'svgs',
      target: 5,
      unit: 'svg',
    },
  ],
};

export const activity: Tracker = {
  ...baseTracker,
  id: 'activity',
  metricId: 'activity',
  name: 'activity',
  icon: 'running',
  color: '#CD335E',
  resourceType: 'Observation',
  code: 'activity',
  order: 2,
  units: [
    {
      code: 'activity',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 30,
      unit: 'min',
    },
  ],
};

export const mindfulness: Tracker = {
  ...baseTracker,
  id: 'self-care',
  metricId: 'self-care',
  name: 'mindfulness',
  icon: 'heart',
  color: '#EFC002',
  resourceType: 'Procedure',
  code: 'self-care',
  order: 3,
  units: [
    {
      code: 'self-care',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 15,
      unit: 'min',
    },
  ],
};

export const sleep: Tracker = {
  ...baseTracker,
  id: 'sleep',
  metricId: 'sleep',
  name: 'sleep',
  color: '#6956D0',
  icon: 'moon',
  resourceType: 'Procedure',
  code: 'code',
  order: 4,
  units: [
    {
      code: 'sleep',
      default: true,
      display: 'hrs',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 7,
      unit: 'hr',
    },
  ],
};

export const school: Tracker = {
  ...baseTracker,
  id: 'school',
  metricId: 'school',
  name: 'school',
  icon: 'book-open',
  resourceType: 'Procedure',
  code: 'school',
  color: '#00A7D4',
  order: 5,
  units: [
    {
      code: 'school',
      default: true,
      display: 'min',
      system: 'http://lifeomic.com/fhir/track-tile-pillar-value/health-plants',
      target: 60,
      unit: 'min',
    },
  ],
};

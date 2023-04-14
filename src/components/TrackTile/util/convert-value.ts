import i18n from '../../../../lib/i18n';
import { Tracker, UnitType } from '../services/TrackTileService';

type Unit = 's' | 'min' | 'h' | string;

const converters: Record<Unit, Record<Unit, (value: number) => number>> = {
  s: {
    min: (v) => Math.round(v / 60),
    h: (v) => Math.round(v / (60 * 60)),
  },
  min: {
    s: (v) => v * 60,
    h: (v) => Math.round(v / 60),
  },
  h: {
    s: (v) => v * 60 * 60,
    min: (v) => v * 60,
  },
};

type ConvertableTracker = Pick<Tracker, 'resourceType' | 'units' | 'unit'>;

export const getPreferredUnitType = (tracker: ConvertableTracker): UnitType => {
  return (
    tracker.units.find((u) => u.unit === tracker.unit) ||
    tracker.units.find((u) => u.default) ||
    tracker.units[0]
  );
};

export const getStoredUnitType = (tracker: ConvertableTracker): UnitType => {
  let storedUnit: UnitType;
  if (tracker.resourceType === 'Procedure') {
    // NOTE: This is enforced by implementors of TrackTileService (e.g.
    // useAxiosTrackTileService) always returning Procedure values as seconds.
    storedUnit = {
      code: 's',
      unit: 's',
      display: 'seconds',
      system: 'http://unitsofmeasure.org',
      default: true,
      target: 0,
    };
  } else {
    storedUnit = tracker.units.find((u) => u.default) || tracker.units[0];
  }
  return storedUnit;
};

export const convertToPreferredUnit = (
  value: number,
  tracker: ConvertableTracker,
) => {
  const storedUnit = getStoredUnitType(tracker)?.code;
  const preferredUnit = getPreferredUnitType(tracker)?.code;
  const converter =
    converters?.[storedUnit]?.[preferredUnit || ''] ?? ((v: number) => v);
  return converter(value);
};

export const convertToStoreUnit = (
  value: number,
  tracker: ConvertableTracker,
) => {
  const storeUnit = getStoredUnitType(tracker)?.code;
  const preferredUnit = getPreferredUnitType(tracker)?.code;
  const converter =
    converters?.[preferredUnit]?.[storeUnit || ''] ?? ((v: number) => v);
  return converter(value);
};

export const convertToISONumber = (number: string) => {
  switch (i18n.language) {
    case 'ar': {
      return number
        .replace(/٬/g, '')
        .replace(/٫/g, '.')
        .replace(
          /[٠١٢٣٤٥٦٧٨٩]/g,
          (digit) => (digit.charCodeAt(0) - 1632).toString(), // convert Arabic numbers
        );
    }
    case 'es':
    case 'de':
    case 'fr':
    case 'pt':
    case 'tr': {
      return number.replace(/ /g, '').replace(/\./g, '').replace(/,/g, '.');
    }
    default:
      return number.replace(/,/g, '');
  }
};

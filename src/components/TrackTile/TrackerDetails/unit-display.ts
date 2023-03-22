import { Tracker, UnitType } from '../services/TrackTileService';
import { convertToPreferredUnit } from '../util/convert-value';
import i18n from '@i18n';

type UnitDisplayConfig = {
  value: number;
  unit: UnitType;
  tracker: Tracker;
  skipInterpolation?: boolean;
};

export const unitDisplay = ({
  value,
  unit,
  tracker,
  skipInterpolation = false,
}: UnitDisplayConfig) => {
  // This should never happen. If it does it means we are missing translations.
  const defaultDisplay = `{{count}} ${unit.display.replace(/^(.)/, (match) =>
    match.toUpperCase(),
  )}`;

  return i18n
    .t(tracker.id, {
      count: convertToPreferredUnit(value, tracker),
      defaultValue_zero: unit.displayZero ?? defaultDisplay,
      defaultValue_one: unit.displayOne ?? defaultDisplay,
      defaultValue_two: unit.displayTwo ?? defaultDisplay,
      defaultValue_few: unit.displayFew ?? defaultDisplay,
      defaultValue_many: unit.displayMany ?? defaultDisplay,
      defaultValue_other: unit.displayOther ?? defaultDisplay,
      skipInterpolation,
      ns: 'track-tile-ui',
    })
    .replace('{{count}}', '')
    .replace(/\s+/g, ' ')
    .trim();
};

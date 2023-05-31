import { Tracker, UnitType } from '../services/TrackTileService';
import i18n, { t } from '../../../../lib/i18n';
import { upperFirst } from 'lodash';

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
  const defaultOne = `{{count}} ${upperFirst(unit.unit)}`;
  const defaultOther = `{{count}} ${upperFirst(unit.display)}`;
  const defaultDisplay = value === 1 ? defaultOne : defaultOther;

  const normalizedId = tracker.id.replace(/:/g, '&');
  i18n.addResources('en', 'tracker', {
    ...(unit.displayZero && { [`${normalizedId}_zero`]: unit.displayZero }),
    ...(unit.displayOne && { [`${normalizedId}_one`]: unit.displayOne }),
    ...(unit.displayTwo && { [`${normalizedId}_two`]: unit.displayTwo }),
    ...(unit.displayFew && { [`${normalizedId}_few`]: unit.displayFew }),
    ...(unit.displayOther && { [`${normalizedId}_other`]: unit.displayOther }),
  });

  const displayUnit = t(`tracker:${normalizedId}`, {
    count: value,
    skipInterpolation,
    defaultValue: defaultDisplay,
  });

  return displayUnit.replace('{{count}}', '').replace(/\s+/g, ' ').trim();
};

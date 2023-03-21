import ar from './ar.json';
import de from './de.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import pt from './pt.json';
import tr from './tr.json';

import { ResourceKey } from 'i18next';
type LocaleData = (
  language: string
) => () => ResourceKey | boolean | null | undefined;

const TRACK_TILE_UI = 'track-tile-ui';
const trackTileTranslations: LocaleData = (language) => () => {
  switch (language) {
    case 'es':
      return es;
    case 'de':
      return de;
    case 'ar':
      return ar;
    case 'fr':
      return fr;
    case 'pt':
      return pt;
    case 'tr':
      return tr;
    case 'en':
    default:
      return en;
  }
};

const namespaces = {
  [TRACK_TILE_UI]: trackTileTranslations
};

export { namespaces, trackTileTranslations, TRACK_TILE_UI };

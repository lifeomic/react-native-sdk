import { polyfillCanonicalLocalesIfNeeded } from './getCanonicalLocales';
import { polyfillLocaleIfNeeded } from './locale';
import { polyfill } from './numberFormat';
import { polyfillPluralRulesIfNeeded } from './pluralRules';

const loadLocalePolyfills = () => {
  // The order in which these are loaded matters, see: https://formatjs.io/docs/guides/runtime-requirements#react-native-on-ios
  polyfillCanonicalLocalesIfNeeded();
  polyfillLocaleIfNeeded();
  polyfillPluralRulesIfNeeded();
  polyfill();
};

export { loadLocalePolyfills };

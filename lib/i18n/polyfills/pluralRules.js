import { shouldPolyfill } from '@formatjs/intl-pluralrules/should-polyfill';

export const polyfill = () => {
  require('@formatjs/intl-pluralrules/polyfill');

  require('@formatjs/intl-pluralrules/locale-data/en');
  require('@formatjs/intl-pluralrules/locale-data/es');
  require('@formatjs/intl-pluralrules/locale-data/de');
  require('@formatjs/intl-pluralrules/locale-data/pt');
  require('@formatjs/intl-pluralrules/locale-data/tr');
  require('@formatjs/intl-pluralrules/locale-data/ar');
};

export const polyfillPluralRulesIfNeeded = () => {
  if (shouldPolyfill()) {
    polyfill();
  }
};

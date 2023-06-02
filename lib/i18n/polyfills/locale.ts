import { shouldPolyfill } from '@formatjs/intl-locale/should-polyfill';

export const polyfill = () => {
  require('@formatjs/intl-locale/polyfill');
};

export const polyfillLocaleIfNeeded = () => {
  if (shouldPolyfill()) {
    polyfill();
  }
};

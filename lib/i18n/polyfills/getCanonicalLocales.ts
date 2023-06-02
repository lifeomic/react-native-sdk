import { shouldPolyfill } from '@formatjs/intl-getcanonicallocales/should-polyfill';

export const polyfill = () => {
  require('@formatjs/intl-getcanonicallocales/polyfill');
};

export const polyfillCanonicalLocalesIfNeeded = () => {
  if (shouldPolyfill()) {
    polyfill();
  }
};

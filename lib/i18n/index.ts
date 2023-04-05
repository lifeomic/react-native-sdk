import 'intl-pluralrules';
import i18next, { t } from 'i18next';
import { initReactI18next } from 'react-i18next';
export { Trans } from 'react-i18next';

// See https://github.com/i18next/react-i18next/issues/1587#issuecomment-1386909661
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

// Skeleton instance will enable building i18n ready components
export function configure() {
  return i18next.use(initReactI18next).init({
    fallbackLng: 'en',
    debug: false && __DEV__ && process.env.NODE_ENV !== 'test', // Remove `false` to debug locally

    react: {
      useSuspense: true,
    },

    interpolation: {
      escapeValue: false,
    },
  });
}

// There are some load order issues in the test suite, and this is needed to ensure that
// the tests force the configuration no matter what order things are loaded in
if (process.env.NODE_ENV === 'test') {
  if (!i18next.isInitialized) {
    configure();
  }
}

export { t };
export default i18next;

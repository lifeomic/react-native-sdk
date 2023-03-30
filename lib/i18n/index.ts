import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NamespaceLoader } from './backend';
import { namespaces, TRACK_TILE_UI } from './locales';

export { Trans } from 'react-i18next';

// See https://github.com/i18next/react-i18next/issues/1587#issuecomment-1386909661
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

// Skeleton instance will enable building i18n ready components
export function configure() {
  return i18next
    .use(NamespaceLoader)
    .use(initReactI18next)
    .init({
      backend: {
        namespaces,
      },
      ns: Object.keys(namespaces),

      // compatibilityJSON: 'v3',
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

if (!i18next.hasLoadedNamespace(TRACK_TILE_UI)) {
  i18next.loadNamespaces(TRACK_TILE_UI);
}

export default i18next;

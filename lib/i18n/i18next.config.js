// i18next parser config -  See: https://github.com/i18next/i18next-parser

module.exports = {
  createOldCatalogs: false,

  locales: ['ar', 'de', 'en', 'es', 'fr', 'pt', 'tr'],
  defaultValue: (_locale, _namespace, key) => {
    if (key === 'intlNumber') return '{{val , number}}';
    if (key === 'intlDateTime') return '{{val, datetime}}';
  },
  defaultNamespace: 'track-tile-ui',
  input: ['../../src/**/*.{ts,tsx,js,jsx}'],
  output: 'src/i18n/locales/$LOCALE.json',

  sort: true,

  resetDefaultValueLocale: 'en'

  /* TODO: Enable these for CI
    failOnWarnings: true,
    failOnUpdate: true
  */
};

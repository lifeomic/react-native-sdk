export const polyfill = () => {
  // We are running into issues where the native Intl (namely android 12) passes the polyfill check but
  // does not support all of the things we need. The interim fix is to force a polyfill.
  require('@formatjs/intl-numberformat/polyfill-force');

  require('@formatjs/intl-numberformat/locale-data/en');
  require('@formatjs/intl-numberformat/locale-data/es');
  require('@formatjs/intl-numberformat/locale-data/de');
  require('@formatjs/intl-numberformat/locale-data/pt');
  require('@formatjs/intl-numberformat/locale-data/tr');
  require('@formatjs/intl-numberformat/locale-data/ar');
  require('@formatjs/intl-numberformat/locale-data/fr');
};

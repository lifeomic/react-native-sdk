export const SupportedLocales = [
  'ar',
  'de',
  'en',
  'es',
  'fr',
  'pt',
  'tr'
] as const;

// Generate a union type from the values of SupportedLocales
export type Locale = typeof SupportedLocales[number];
export type LocaleProviding<T> = Record<Locale, T>;

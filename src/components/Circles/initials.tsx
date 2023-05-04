/**
 *
 * @param name the name used to compute the initials
 * @returns the first character of the string and the last whole word's first character, joined together, and upper-cased
 * @example initials('Samuel L. jackson') => 'SJ'
 * initials('Madonna') => 'M'
 */
export const initials = (name?: string) =>
  name
    ?.trim()
    .match(/(.).*[\s](.).*/)
    ?.slice(1, 3)
    .map((v) => v.toUpperCase())
    .join('') || '';

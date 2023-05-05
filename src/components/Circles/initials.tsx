/**
 * @param name the name used to compute the initials
 * @returns the first character of the first word and the last word's first character, joined together, and upper-cased
 * @example initials('Samuel L. jackson') => 'SJ'
 * initials('Madonna') => 'M'
 */
export const initials = (name = '') => {
  const parts = name.trim().split(/\s+/);

  return `${parts[0][0] ?? ''}${
    parts.length > 1 ? parts[parts.length - 1][0] : ''
  }`.toUpperCase();
};

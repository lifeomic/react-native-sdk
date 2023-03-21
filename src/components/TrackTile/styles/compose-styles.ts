import { StyleSheet } from 'react-native';

export type NamedStyles = Partial<ReturnType<typeof StyleSheet.create>>;

export type StylesProp<T> = Partial<Record<keyof T, NamedStyles[string]>>;

export const composeStyles = <T extends NamedStyles>(
  stylesA: T,
  stylesB: StylesProp<T> = {}
) => {
  const merged = { ...stylesA };
  let prop: keyof StylesProp<T>;
  for (prop in stylesA) {
    if (prop in stylesB) {
      merged[prop] = StyleSheet.compose(
        stylesA[prop],
        stylesB[prop] || {}
      ) as any;
    }
  }

  return merged;
};

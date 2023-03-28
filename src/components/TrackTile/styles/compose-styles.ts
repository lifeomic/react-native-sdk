import { StyleSheet } from 'react-native';

export type NamedStyles = Partial<ReturnType<typeof StyleSheet.create>>;

export type StylesProp<T> = Partial<Record<keyof T, NamedStyles[string]>>;

export const composeStyles = <T extends NamedStyles>(
  stylesA: T,
  stylesB: StylesProp<T> = {},
) => {
  const merged = { ...stylesA };
  let prop: keyof StylesProp<T>;
  for (prop in stylesA) {
    if (prop in stylesB) {
      merged[prop] = StyleSheet.compose(
        stylesA[prop],
        // Ignore for the moment, this file will be replaced by the new createStyles
        // @ts-ignore
        stylesB[prop] || {},
      ) as any;
    }
  }

  return merged;
};

import { NamedStyles } from '../styles';
import { pick, mapValues } from 'lodash';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const useFlattenedStyles = <T extends NamedStyles, K extends keyof T>(
  styles: T,
  styleNames: K[],
) => {
  return useMemo(
    () => mapValues(pick(styles, styleNames), StyleSheet.flatten) as Pick<T, K>,
    [styleNames, styles],
  );
};

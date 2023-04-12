import React from 'react';
import merge from 'lodash/merge';
import { RecursivePartial } from '@styles';

import { DefaultTheme as reactNavigationDefault } from '@react-navigation/native';
import {
  DefaultTheme as MD3DefaultTheme,
  useTheme as usePaperTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import * as baseDefaultTheme from './base/default';

// Merges baseDefaultTheme and reactNavigationDefault into MD3DefaultTheme
// which is the default theme returned by usePaperTheme
const combinedDefaultTheme = merge(
  MD3DefaultTheme,
  reactNavigationDefault,
  baseDefaultTheme,
);

export type Theme = typeof combinedDefaultTheme;

export type ThemeProp = RecursivePartial<Theme>;

export const useTheme = () => usePaperTheme<Theme>();

interface Props {
  theme: ThemeProp;
  children: React.ReactNode;
}

export function ThemeProvider({ theme: customTheme, children }: Props) {
  const materialDefault = merge(
    {},
    MD3DefaultTheme,
    baseDefaultTheme,
    customTheme,
  );

  const { LightTheme: DefaultTheme } = adaptNavigationTheme({
    reactNavigationLight: reactNavigationDefault,
    reactNavigationDark: reactNavigationDefault,
    materialLight: materialDefault,
    materialDark: materialDefault,
  });

  const defaultTheme = merge({}, DefaultTheme, materialDefault);

  return <PaperProvider theme={defaultTheme}>{children}</PaperProvider>;
}

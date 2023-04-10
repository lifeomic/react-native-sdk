import React from 'react';

import { DefaultTheme as reactNavigationDefault } from '@react-navigation/native';

import {
  MD3LightTheme as MD3DefaultTheme,
  useTheme as usePaperTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

import * as baseDefaultTheme from './base/default';

import merge from 'lodash/merge';
import { RecursivePartial } from '@styles';

const combinedDefaultTheme = merge(
  {},
  reactNavigationDefault,
  MD3DefaultTheme,
  baseDefaultTheme,
);

export type Theme = typeof combinedDefaultTheme & MD3Theme;

export type ThemeProp = RecursivePartial<Theme>;

export const useTheme = () => usePaperTheme<Theme>(combinedDefaultTheme);

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

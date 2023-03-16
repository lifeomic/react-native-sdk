import React from 'react';

import {
  DefaultTheme as reactNavigationLight,
  DarkTheme as reactNavigationDark,
} from '@react-navigation/native';

import {
  MD3LightTheme,
  MD3DarkTheme,
  useTheme as usePaperTheme,
  adaptNavigationTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

import * as baseLightTheme from './base/light';
// TODO: When we decide to support a dark theme, import here
import * as baseDarkTheme from './base/light';

import merge from 'lodash/merge';
import { RecursivePartial } from '@styles';

const combinedLightTheme = merge(
  {},
  reactNavigationLight,
  MD3LightTheme,
  baseLightTheme,
);

const combinedDarkTheme = merge(
  {},
  reactNavigationDark,
  MD3DarkTheme,
  baseDarkTheme,
);

export type Theme = typeof combinedLightTheme &
  typeof combinedDarkTheme &
  MD3Theme;

export type ThemeProp = RecursivePartial<Theme>;

export const useTheme = () => usePaperTheme<Theme>();

interface Props {
  theme: ThemeProp;
  children: React.ReactNode;
}

export function ThemeProvider({ theme: customTheme, children }: Props) {
  // TODO: When we decide to support a dark theme, add this to context/state
  const isThemeDark = false;

  const materialLight = merge({}, MD3LightTheme, baseLightTheme, customTheme);
  const materialDark = merge({}, MD3DarkTheme, baseDarkTheme, customTheme);

  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight,
    reactNavigationDark,
    materialLight,
    materialDark,
  });

  const lightTheme = merge({}, LightTheme, materialLight);
  const darkTheme = merge({}, DarkTheme, materialDark);

  const theme = isThemeDark ? darkTheme : lightTheme;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

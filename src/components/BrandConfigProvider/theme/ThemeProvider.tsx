import React from 'react';

import {
  MD3LightTheme as defaultPaperTheme,
  Provider as PaperProvider,
  useTheme as usePaperTheme,
} from 'react-native-paper';
import * as baseTheme from './base';
import merge from 'lodash/merge';
import { RecursivePartial } from '@styles';

const defaultTheme = merge({}, defaultPaperTheme, baseTheme);

export type Theme = typeof defaultTheme;
export type ThemeProp = RecursivePartial<Theme>;

export const useTheme = () => usePaperTheme<Theme>();

interface Props {
  theme: ThemeProp;
  children: React.ReactNode;
}

export function ThemeProvider({ theme: customTheme, children }: Props) {
  const theme = merge({}, defaultTheme, customTheme);

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

import React from 'react';
import { ThemeProvider, ThemeProp } from './theme/ThemeProvider';
import { StylesProvider } from './styles/StylesProvider';
import { BrandConfigProviderStyles } from './styles/types';
interface Props {
  theme?: ThemeProp;
  styles?: BrandConfigProviderStyles;
  children: React.ReactNode;
}

export function BrandConfigProvider({ theme, styles, children }: Props) {
  return (
    <ThemeProvider theme={theme || {}}>
      <StylesProvider styles={styles || {}}>{children}</StylesProvider>
    </ThemeProvider>
  );
}

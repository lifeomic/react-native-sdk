import React from 'react';
import { ThemeProvider, ThemeProp } from './theme/ThemeProvider';
import { StylesProvider } from './styles/StylesProvider';
import { BrandConfigProviderStyles } from './styles/types';
import { IconProvider, Icons } from './icons/IconProvider';
interface Props {
  theme?: ThemeProp;
  styles?: BrandConfigProviderStyles;
  icons?: Partial<Icons>;
  children: React.ReactNode;
}

export function BrandConfigProvider({ theme, styles, icons, children }: Props) {
  return (
    <ThemeProvider theme={theme || {}}>
      <StylesProvider styles={styles || {}}>
        <IconProvider icons={icons}>{children}</IconProvider>
      </StylesProvider>
    </ThemeProvider>
  );
}

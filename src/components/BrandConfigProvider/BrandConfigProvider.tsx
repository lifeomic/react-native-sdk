import React from 'react';
import { Theme } from './theme/Theme';
import { ThemeProvider } from './theme/ThemeProvider';
import { StylesProvider } from './styles/StylesProvider';
import { BrandConfigProviderStyles } from './types';

export const BrandConfigContext = React.createContext<{ theme: Theme }>({
  theme: new Theme(),
});

interface Props {
  theme?: Theme;
  styles?: BrandConfigProviderStyles;
  children: React.ReactNode;
}

export function BrandConfigProvider({ theme, styles, children }: Props) {
  if (!theme) {
    theme = new Theme();
  }

  const context = {
    theme,
  };

  return (
    <BrandConfigContext.Provider value={context}>
      <ThemeProvider theme={theme}>
        <StylesProvider theme={theme} componentStyles={styles || {}}>
          {children}
        </StylesProvider>
      </ThemeProvider>
    </BrandConfigContext.Provider>
  );
}

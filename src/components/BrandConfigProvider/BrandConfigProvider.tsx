import React from 'react';
import { Theme } from './theme/Theme';
import { ThemeProvider } from './theme/ThemeProvider';

export const BrandConfigContext = React.createContext<{ theme: Theme }>({
  theme: new Theme(),
});

interface Props {
  theme?: Theme;
  children: React.ReactNode;
}

export function BrandConfigProvider({ theme, children }: Props) {
  if (!theme) {
    theme = new Theme();
  }

  const context = {
    theme,
  };

  return (
    <BrandConfigContext.Provider value={context}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrandConfigContext.Provider>
  );
}

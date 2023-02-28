import React from 'react';
import { Theme } from './Theme';

interface Props {
  theme: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: Props) {
  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
}

export const ThemeContext = React.createContext<{ theme: Theme }>({
  theme: new Theme(),
});

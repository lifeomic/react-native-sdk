import React from 'react';
import { Theme } from './Theme';
import { Styles } from './Styles';

export interface BrandConfig {
  theme: Theme;
  styles: Styles;
}

export const BrandConfigContext = React.createContext<BrandConfig>({
  theme: new Theme(),
  styles: new Styles(),
});

interface Props {
  theme?: Theme;
  styles?: Styles;
  children: React.ReactNode;
}

export function BrandConfigProvider({ theme, styles, children }: Props) {
  if (!theme) {
    theme = new Theme();
  }

  if (!styles) {
    styles = new Styles({ theme });
  }

  const context = {
    theme,
    styles,
  };

  return (
    <BrandConfigContext.Provider value={context}>
      {children}
    </BrandConfigContext.Provider>
  );
}

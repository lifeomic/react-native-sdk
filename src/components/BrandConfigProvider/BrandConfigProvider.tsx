import React from 'react';
import { StyleSheet } from 'react-native';
import { TextStyles, defaultTextStyles } from '../Text';
import { Theme } from './Theme';

export interface BrandConfig {
  theme: Theme;
  styles: {
    Text?: TextStyles;
  };
}

export const BrandConfigContext = React.createContext<BrandConfig>({
  theme: new Theme(),
  styles: {},
});

interface Props {
  theme?: Theme;
  styles?: Partial<BrandConfig['styles']>;
  children: React.ReactNode;
}

export function BrandConfigProvider({ theme, styles, children }: Props) {
  if (!theme) {
    theme = new Theme();
  }

  const defaultStyles: any = {
    Text: defaultTextStyles(theme),
  };

  const mergedStyles = StyleSheet.flatten<BrandConfig['styles']>([
    defaultStyles,
    styles,
  ]);

  const context = {
    theme,
    styles: mergedStyles,
  };

  return (
    <BrandConfigContext.Provider value={context}>
      {children}
    </BrandConfigContext.Provider>
  );
}

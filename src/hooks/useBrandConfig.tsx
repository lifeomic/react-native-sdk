import React from 'react';
import { StyleSheet } from 'react-native';
import { TextStyles, defaultTextStyles } from '../components/Text';
import * as theme from '../theme';

export interface BrandConfig {
  styles: {
    Text?: TextStyles | undefined;
  };
  theme: {};
}

const BrandConfigContext = React.createContext<BrandConfig>({
  styles: {
    Text: defaultTextStyles,
  },
  theme,
});

interface Props {
  styles?: BrandConfig['styles'];
  children: React.ReactNode;
}

export function BrandConfigProvider({ styles, children }: Props) {
  const defaultStyles = {
    Text: defaultTextStyles,
  };

  const mergedStyles = StyleSheet.flatten<BrandConfig['styles']>([
    defaultStyles,
    styles,
  ]) as BrandConfig['styles']; // TODO: Better typing

  const context = {
    styles: mergedStyles,
    theme,
  };

  return (
    <BrandConfigContext.Provider value={context}>
      {children}
    </BrandConfigContext.Provider>
  );
}

export const useBrandConfig = () => React.useContext(BrandConfigContext);

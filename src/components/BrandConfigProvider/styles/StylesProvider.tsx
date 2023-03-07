import * as React from 'react';
import merge from 'lodash/merge';
import {
  ComponentStyles,
  RecursivePartial,
  StylesBuilder,
  NamedStyles,
  BrandConfigProviderStyles,
} from './types';
import { useTheme } from '../theme/ThemeProvider';

export const StylesContext = React.createContext({
  styles: {} as RecursivePartial<ComponentStyles>,
});

export const useStyles = <T extends StylesBuilder>(
  name: keyof ComponentStyles,
  builder: T,
  styleOverrides?: NamedStylesProp<T>,
) => {
  const theme = useTheme();
  const { styles: componentStyles } = React.useContext(StylesContext);

  const styles = merge(
    {},
    typeof builder === 'function' ? builder(theme) : builder,
    componentStyles[name],
    styleOverrides,
  ) as NamedStyles<T>;

  return { styles };
};

interface Props {
  styles: BrandConfigProviderStyles;
  children: React.ReactNode;
}

export function StylesProvider({ styles = {}, children }: Props) {
  return (
    <StylesContext.Provider
      value={{
        styles,
      }}
    >
      {children}
    </StylesContext.Provider>
  );
}

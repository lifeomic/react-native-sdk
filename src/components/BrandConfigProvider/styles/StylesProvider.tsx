import * as React from 'react';
import { merge } from 'lodash';
import {
  ComponentStyles,
  RecursivePartial,
  StylesBuilder,
  NamedStyles,
  NamedStylesProp,
  BrandConfigProviderStyles,
} from '../types';
import { Theme } from '../theme/Theme';
import { useTheme } from '../../../hooks/useTheme';

export const StylesContext = React.createContext({
  componentStyles: {} as RecursivePartial<ComponentStyles>,
});

export const useStyles = <T extends StylesBuilder>(
  name: keyof ComponentStyles,
  builder: T,
  styleOverrides?: NamedStylesProp<T>,
) => {
  const { theme } = useTheme();
  const { componentStyles } = React.useContext(StylesContext);

  const styles = merge(
    {},
    typeof builder === 'function' ? builder(theme) : builder,
    componentStyles[name],
    styleOverrides,
  ) as NamedStyles<T>;

  return { styles };
};

interface Props {
  componentStyles: BrandConfigProviderStyles;
  theme: RecursivePartial<Theme>;
  children: React.ReactNode;
}

export function StylesProvider({ componentStyles = {}, children }: Props) {
  return (
    <StylesContext.Provider
      value={{
        componentStyles,
      }}
    >
      {children}
    </StylesContext.Provider>
  );
}

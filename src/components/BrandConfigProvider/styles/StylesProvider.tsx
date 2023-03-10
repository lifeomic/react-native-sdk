import * as React from 'react';
import merge from 'lodash/merge';
import { ComponentStyles, BrandConfigProviderStyles } from './types';
import { useTheme } from '../theme/ThemeProvider';
import { CreateStyles } from './createStyles';

export const StylesContext = React.createContext({
  styles: {} as BrandConfigProviderStyles,
});

export const useStyles = <
  T extends ReturnType<CreateStyles<keyof ComponentStyles>>,
>(
  builder: T,
  styleOverrides?: NamedStylesProp<T>,
) => {
  const theme = useTheme();
  const { styles: componentStyles } = React.useContext(StylesContext);
  const [namespace, namedStyles] = builder(theme);

  const styles = merge(
    {},
    namedStyles,
    componentStyles[namespace],
    styleOverrides,
  ) as NamedStylesProp<T>;

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

import React, { useMemo } from 'react';
import { composeStyles, NamedStyles, StylesProp } from './compose-styles';

export const StyleOverridesContext = React.createContext<NamedStyles>(
  undefined as any,
);
export const StyleOverridesProvider = StyleOverridesContext.Provider;

export const useStyleOverrides = <T extends NamedStyles>(defaultStyles: T) => {
  const ctx = React.useContext(StyleOverridesContext);

  return useMemo(
    () => composeStyles(defaultStyles, ctx as StylesProp<T>),
    [defaultStyles, ctx],
  );
};

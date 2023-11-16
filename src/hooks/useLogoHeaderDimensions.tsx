import React, { createContext, useContext, useState } from 'react';
import { LayoutRectangle } from 'react-native';

const defaultValue: LayoutRectangle = {
  x: 0,
  y: 0,
  height: 0,
  width: 0,
};
const LogoHeaderContext = createContext([{ ...defaultValue }, () => {}] as [
  LayoutRectangle,
  React.Dispatch<React.SetStateAction<LayoutRectangle>>,
]);

type Props = {
  children?: React.ReactNode;
};

export const LogoHeaderDimensionsContextProvider = ({ children }: Props) => {
  const state = useState<LayoutRectangle>({ ...defaultValue });

  return (
    <LogoHeaderContext.Provider value={state}>
      {children}
    </LogoHeaderContext.Provider>
  );
};

export const useLogoHeaderDimensions = () => useContext(LogoHeaderContext);

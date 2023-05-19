import React, { createContext, useContext } from 'react';
import * as Chromicons from '@lifeomic/chromicons-native';

export type Icons = typeof Chromicons & Record<string, React.ComponentType>;

const IconContext = createContext<Icons>(Chromicons);

export const useIcons = () => useContext(IconContext);

type Props = { children: React.ReactNode; icons?: Partial<Icons> };

export const IconProvider = ({ children, icons }: Props) => (
  <IconContext.Provider value={{ ...Chromicons, ...icons }}>
    {children}
  </IconContext.Provider>
);

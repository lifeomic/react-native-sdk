import React, { createContext, useContext } from 'react';
import * as Chromicons from '@lifeomic/chromicons-native';
import { TriangleFilled } from './TriangleFilled';

export type ChromiconName = keyof typeof Chromicons;

export type Icons = typeof Chromicons &
  Record<string, React.ComponentType> & {
    TriangleFilled: typeof TriangleFilled;
  };

const IconContext = createContext<Icons>({ ...Chromicons, TriangleFilled });

export const useIcons = () => useContext(IconContext);

type Props = { children: React.ReactNode; icons?: Partial<Icons> };

export const IconProvider = ({ children, icons }: Props) => (
  <IconContext.Provider value={{ ...Chromicons, ...icons, TriangleFilled }}>
    {children}
  </IconContext.Provider>
);

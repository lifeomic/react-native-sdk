import React, { createContext, useContext, useMemo } from 'react';
import * as Chromicons from '@lifeomic/chromicons-native';
import { TriangleFilled } from './TriangleFilled';
import mapValues from 'lodash/mapValues';

export type ChromiconName = keyof typeof Chromicons;

export type Icons = typeof Chromicons &
  Record<string, React.ComponentType> & {
    TriangleFilled: typeof TriangleFilled;
  };

const DefaultIcons = { ...Chromicons, TriangleFilled };

const IconContext = createContext<Icons>(DefaultIcons);

export const useIcons = () => useContext(IconContext);

type Props = {
  children: React.ReactNode;
  icons?: Partial<Icons>;
  iconAliases?: Record<string, string>;
};

export const IconProvider = ({ children, icons, iconAliases = {} }: Props) => {
  const value = useMemo(() => {
    const baseIcons: Icons = { ...DefaultIcons, ...icons };

    return {
      ...baseIcons,
      ...mapValues(iconAliases, (mapTo) => baseIcons[mapTo]),
    };
  }, [iconAliases, icons]);

  return <IconContext.Provider value={value}>{children}</IconContext.Provider>;
};

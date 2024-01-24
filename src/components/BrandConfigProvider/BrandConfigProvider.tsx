import React, { useEffect, useState } from 'react';
import { ThemeProvider, ThemeProp } from './theme/ThemeProvider';
import { StylesProvider } from './styles/StylesProvider';
import { BrandConfigProviderStyles } from './styles/types';
import { IconProvider, Icons } from './icons/IconProvider';
import {
  appConfigNotifier,
  AppConfigChangeHandler,
} from '../../common/AppConfigNotifier';
import { merge } from 'lodash';

interface Props {
  theme?: ThemeProp;
  styles?: BrandConfigProviderStyles;
  icons?: Partial<Icons>;
  children: React.ReactNode;
}

export type Brand = Pick<Props, 'theme' | 'styles' | 'icons'>;

export function BrandConfigProvider({ theme, styles, icons, children }: Props) {
  const [brand, setBrand] = useState({
    theme: theme || {},
    styles: styles || {},
    icons: icons,
    iconAliases: {} as Record<string, string>,
  });

  useEffect(() => {
    const listener: AppConfigChangeHandler = (config) => {
      if (config?.brand) {
        setBrand((currentBrand) => merge({}, currentBrand, config.brand));
      }
    };

    const { unsubscribe } = appConfigNotifier.addListener(listener);

    return unsubscribe;
  }, []);

  return (
    <ThemeProvider theme={brand.theme}>
      <StylesProvider styles={brand.styles}>
        <IconProvider icons={brand.icons} iconAliases={brand.iconAliases}>
          {children}
        </IconProvider>
      </StylesProvider>
    </ThemeProvider>
  );
}

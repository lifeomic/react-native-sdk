import { ComponentType } from 'react';
import { getBundleId } from 'react-native-device-info';
import { AppTile } from '../hooks/useAppConfig';
import { SvgProps } from 'react-native-svg';
import { Theme } from '../components/BrandConfigProvider';

/**
 * DeveloperConfig provides a single interface to configure the app at build-time.
 * Unlike useAppConfig, which is populated at runtime via API, properties in this
 * type are provided at dev/build time.  Another way to think about it is this is a
 * high-level development interface for devs using RootProviders and RootStack.
 *
 * NOTE: All props are optional, and DeveloperConfigProvider is not required in
 * your app.
 *
 * @param appTileScreens Allows for custom screens to be registered to be launched
 * when an app tile with a matching URL is tapped.
 *
 * @param simpleTheme Allows for configuring a theme via a primary and accent color.
 *
 * @param apiBaseURL Allows for configuring a custom base API URL. This is only
 * needed when performing advanced debugging involving a dev mock server.
 *
 * @param additionalNavigationTab Allows for configuring a custom additional material
 * bottom navigation tab (in addition to Home, Notifications, and Settings.
 */
export interface RouteColor {
  route: string;
  color: (theme: Theme) => string;
}

export type DeveloperConfig = {
  appTileScreens?: AppTileScreens;
  simpleTheme?: SimpleTheme;
  apiBaseURL?: string;
  additionalNavigationTabs?: AdditionalNavigationTab[];
  AppNavHeader?: {
    headerColors?: RouteColor[];
    onHeaderColors?: RouteColor[];
  };
};

export type AppTileScreens = {
  [key: string]: ComponentType;
};

export type SimpleTheme = {
  primaryColor: string;
};

export function getCustomAppTileComponent(
  appTileScreens?: AppTileScreens,
  appTile?: AppTile,
) {
  return (
    !!appTile?.source.url &&
    (appTileScreens?.[appTile.source.url] ||
      appTile.source.url.startsWith(getBundleId()))
  );
}

export type AdditionalNavigationTab = {
  name: string;
  component: () => JSX.Element;
  options: {
    tabBarLabel: string;
    tabBarIcon: string | ((props: SvgProps) => JSX.Element);
  };
};

import { ComponentType } from 'react';
import { AppTile } from '../hooks/useAppConfig';

/**
 * DeveloperConfig provides a single interface to configure the app at build-time.
 * Unlike useAppConfig, which is populated at runtime via API, properties in this
 * type are provided at dev/build time.  Another way to think about it is this is a
 * high-level development interface for dev using RootProviders and RootStack.
 *
 * NOTE: All props must be optional - see DeveloperConfigProvider
 */
export type DeveloperConfig = {
  appTileScreens?: AppTileScreens;
};

export type AppTileScreens = {
  [key: string]: ComponentType;
};

export function getCustomAppTileComponent(
  appTileScreens?: AppTileScreens,
  appTile?: AppTile,
) {
  return !!appTile?.source.url && appTileScreens?.[appTile.source.url];
}

import * as React from 'react';
import { NativeWearableLifecycleHandler } from './WearableTypes';

/**
 * This a placeholder file that can be overriden during the build process
 * to include Lifeomic Platform provided wearable functionality.
 *
 * Native wearable lifecycle handlers and hooks, i.e HealthKit, can be
 * injected into this file to provide additional native functionality
 * which is not available in the dev environment.
 */

/**
 * Additional native lifecycle handlers can be added to this list and will
 * be loaded by the WearableLifecycleProvider
 */
export const platformLifecycleHandlers: NativeWearableLifecycleHandler[] = [];

type Props = { children: React.ReactNode };
export const PlatformLifecycleHandlersProvider = ({ children }: Props) => {
  /**
   * Additional functionality can be added here to manage syncing wearable data.
   */
  return <>{children}</>;
};

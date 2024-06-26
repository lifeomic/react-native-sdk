import React, { ComponentType } from 'react';
import { getBundleId } from 'react-native-device-info';
import { AppTile, TabStyle } from '../hooks/useAppConfig';
import { SvgProps } from 'react-native-svg';
import { Brand, Theme } from '../components/BrandConfigProvider';
import {
  LinkingOptions,
  NavigationState,
  ParamListBase,
  TypedNavigator,
} from '@react-navigation/native';
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { PointBreakdownProps } from '../components/SocialShare/renderers/point-breakdown';
import { ImageSourcePropType } from 'react-native';
import { Route } from '../navigators/types';
import { LogoHeaderOptions } from '../hooks/useLogoHeaderOptions';
import { EducationContent } from '../components/TrackTile/services/TrackTileService';
import { Project } from '../hooks/useSubjectProjects';
import type { CustomConsentScreenProps } from '../screens/ConsentScreen';

/**
 * DeveloperConfig provides a single interface to configure the app at build-time.
 * Unlike useAppConfig, which is populated at runtime via API, properties in this
 * type are provided at dev/build time.  Another way to think about it is this is a
 * high-level development interface for devs using RootProviders and LoggedInStack.
 *
 * NOTE: All props are optional, and DeveloperConfigProvider is not required in
 * your app.
 *
 * @param appTileScreens Allows for custom screens to be registered to be launched
 * when an app tile with a matching URL is tapped.
 *
 * @param simpleTheme Allows for configuring a theme via a primary color.
 *
 * @param apiBaseURL Allows for configuring a custom base API URL. This is only
 * needed when performing advanced debugging involving a dev mock server.
 *
 * @param additionalNavigationTab Allows for configuring a custom additional material
 * bottom navigation tab (in addition to Home, Notifications, and Settings.
 *
 * @param renderCustomLoggingScreen Allows for configuring a custom login screen
 *
 * @param ontology.educationContentOverrides Allows for providing overrides
 * for the `educationContent` property of terminology responses.  This enables
 * showing a custom thumbnail image in AdvancedTrackerDetails. The key provided
 * must be the `coding.code` value, e.g. '41950-7' for steps.
 *
 * @param onAppSessionStart Allows for providing a callback to be called when a logged in session starts.  This is useful for analytics tracking, subscription status checks, etc.
 *
 * @param modifySettingScreenMenuItems Allows modifying and injecting menu items into the settings screen
 *
 * @param navigationLinking Allows for configuring deep linking
 */

export interface RouteColor {
  route: string;
  color: (theme: Theme) => string;
}

export type Navigator<
  ParamList extends ParamListBase,
  Props extends Record<string, unknown>,
> = TypedNavigator<
  ParamList,
  NavigationState,
  NativeStackNavigationOptions,
  NativeStackNavigationEventMap,
  React.ComponentType<Props>
>;

export type OnAppSessionStartParams = {
  resumeAppSession: () => void;
  activeProject: Project;
  activeSubjectId: string;
};

export type DeveloperConfig = {
  appTileScreens?: AppTileScreens;
  simpleTheme?: SimpleTheme;
  brand?: Brand;
  apiBaseURL?: string;
  appsAPIBaseURL?: string;
  AppNavHeader?: {
    headerColors?: RouteColor[];
    onHeaderColors?: RouteColor[];
    statusBarHeight?: number;
  };
  componentProps?: {
    TabNavigator?: {
      useTabBar?: boolean;
    };
    TabBar?: {
      showLabels?: boolean;
      tabs?: NavigationTab[];
    };
    TrackerDetails?: {
      showSimpleTargetMessage?: boolean;
      dayPickerShowTodaysUnits?: boolean;
      dayPickerDateFormat?: string;
      radialProgressStrokeWidth?: number;
      radialProgressRadius?: number;
      radialProgressStrokeLinecap?: 'round' | 'square' | 'butt';
      radialProgressRotation?: number;
      metricOverrides?: (
        theme: Theme,
      ) => Record<string, { image?: ImageSourcePropType; color?: string }>;
    };
    LoginScreen?: {
      loginText?: string;
      acceptInviteText?: string;
    };
  };
  pushNotificationsConfig?: PushNotificationsConfig;
  getAdditionalHomeScreens?: <ParamList extends ParamListBase>(
    list: ParamList,
  ) => JSX.Element[];
  CustomHomeScreen?: () => JSX.Element;
  CustomActivityIndicatorView?: React.FC<{
    timeoutMessage: JSX.Element | null;
  }>;
  CustomStacks?: Record<string, () => JSX.Element>;
  renderCustomLoginScreen?: () => JSX.Element;
  CustomConsentScreen?: ComponentType<CustomConsentScreenProps>;
  sharingRenderers?: {
    pointBreakdown: (props: PointBreakdownProps) => React.JSX.Element;
  };
  logoHeaderConfig?: LogoHeaderConfig;
  ontology?: {
    educationContentOverrides?: Record<string, EducationContent>;
  };
  onAppSessionStart?: (params: OnAppSessionStartParams) => Promise<void>;
  modifySettingScreenMenuItems?: (
    items: { id: string; title: string; action: () => void }[],
  ) => { id: string; title: string; action: () => void }[];
  navigationLinking?: LinkingOptions<any>;
  skipInviteParams?: boolean;
  tileListMode?: 'list' | 'column';
  showPreLoginWarning?: boolean;
  /***
   * Instead of showing the invite required screen when no patientId
   * is found retry indefinitely. This is useful if createPatientMapping rule
   * is present for a given account and we do not expect the usual invite to project flow.
   ***/
  keepWaitingForPatientId?: boolean;
  /***
   * Instead of proceeding further into the LoggedInStack show a loading indicator if
   * there the user has no active consents and keep checking for either new consent assignment or active consent status.
   */
  activeConsentRequired?: boolean;
};

export type LogoHeaderConfig = { [key in Route]?: LogoHeaderOptions };

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

export type NavigationTab = {
  name: string;
  component: () => JSX.Element;
  label?: string;
  icon: (props: SvgProps) => JSX.Element;
  styles?: TabStyle;
  headerShown?: boolean;
  color?: string;
  initialParams?: any;
};

export type PushNotificationsConfig = {
  enabled: boolean;
  applicationName: string;
  channelId: string;
  description: string;
};

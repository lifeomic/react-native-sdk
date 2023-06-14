import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { AppTile, CircleTile } from '../hooks/useAppConfig';
import {
  Tracker,
  TrackerValue,
  TrackerValuesContext,
} from '../components/TrackTile/main';
import { Post } from '../hooks';

export type RootStackParamList = {
  LoggedInScreens: NavigatorScreenParams<LoggedInRootParamList>;
  NotLoggedInScreens: NavigatorScreenParams<NotLoggedInRootParamList>;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type LoggedInScreenProps<T extends keyof LoggedInRootParamList> =
  CompositeScreenProps<
    StackScreenProps<LoggedInRootParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type LoggedInRootParamList = {
  LandingTabs: NavigatorScreenParams<TabParamList>;
  HomeScreens: NavigatorScreenParams<HomeStackParamList>;
  SettingsScreens: NavigatorScreenParams<SettingsStackParamList>;
  'screens/ConsentScreen': undefined;
};

export type LoggedInRootScreenProps<T extends keyof LoggedInRootParamList> =
  StackScreenProps<LoggedInRootParamList, T>;

export type NotLoggedInRootParamList = {
  'screens/LoginScreen': { username?: string };
};

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeTabScreenParamList>;
  NotificationsTab: NavigatorScreenParams<NotificationsTabScreenParamList>;
  SettingsTab: NavigatorScreenParams<SettingsTabScreenParamList>;
} & {
  [keyof: string]: undefined;
};

export type HomeTabScreenParamList = {
  HomeTabScreen: undefined;
};

export type HomeTabScreenProps<T extends keyof HomeTabScreenParamList> =
  StackScreenProps<HomeTabScreenParamList, T>;

export type NotificationsTabScreenParamList = {
  NotificationsTabScreen: undefined;
};

export type NotificationsTabScreenProps<
  T extends keyof NotificationsTabScreenParamList,
> = StackScreenProps<NotificationsTabScreenParamList, T>;

export type SettingsTabScreenParamList = {
  SettingsTabScreen: undefined;
};

export type SettingsTabScreenProps<T extends keyof SettingsTabScreenParamList> =
  StackScreenProps<SettingsTabScreenParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = StackScreenProps<
  TabParamList,
  T
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeStackParamList, T>,
    LoggedInRootScreenProps<keyof LoggedInRootParamList>
  >;

export type HomeStackParamList = {
  'Home/AppTile': { appTile: AppTile };
  'Home/AuthedAppTile': {
    appTile: AppTile;
    searchParams?: { [key: string]: string };
  };
  'Home/CustomAppTile': { appTile: AppTile };
  'Home/Circle/Discussion': { circleTile: CircleTile };
  'Home/TrackTile': {
    tracker: Tracker;
    valuesContext: TrackerValuesContext;
    referenceDate?: Date;
  };
  'Home/TrackTileSettings': {
    valuesContext: TrackerValuesContext;
  };
  'Home/AdvancedTrackerDetails': {
    tracker: Tracker;
    valuesContext: TrackerValuesContext;
    referenceDate?: Date;
  };
  'Home/AdvancedTrackerEditor': {
    tracker: Tracker;
    trackerValue: TrackerValue;
    valuesContext: TrackerValuesContext;
  };
  'Home/Circle/Thread': { post: Post; createNewComment?: boolean };
};

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    StackScreenProps<SettingsStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type SettingsStackParamList = {
  'Settings/Profile': undefined;
  'Settings/AccountSelection': undefined;
  'Settings/Wearables': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

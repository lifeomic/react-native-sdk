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

export type RootStackParamList = LoggedInRootParamList;
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type LoggedInScreenProps<T extends keyof LoggedInRootParamList> =
  CompositeScreenProps<
    StackScreenProps<LoggedInRootParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type LoggedInRootParamList = {
  app: NavigatorScreenParams<TabParamList> | undefined;
  'screens/ConsentScreen': undefined;
  InviteRequired: undefined;
  'Circle/Thread': { post: Post; createNewComment?: boolean };
  'screens/OnboardingCourseScreen': undefined;
};

export type LoggedInRootScreenProps<T extends keyof LoggedInRootParamList> =
  StackScreenProps<LoggedInRootParamList, T>;

export type NotLoggedInRootParamList = {
  'screens/LoginScreen': { username?: string };
};

export type TabParamList = {
  HomeTab: undefined;
  NotificationsTab: undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
} & {
  [keyof: string]: undefined;
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    StackScreenProps<HomeStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type HomeStackParamList = {
  Home: undefined;
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
  'Home/MyData': undefined;
  'Home/YoutubePlayer': { youtubeVideoId: string; videoName?: string };
};

export type NotificationsStackParamList = {
  Notifications: undefined;
};

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    StackScreenProps<SettingsStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type SettingsStackParamList = {
  Settings: undefined;
  'Settings/Profile': undefined;
  'Settings/AccountSelection': undefined;
  'Settings/Wearables': undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

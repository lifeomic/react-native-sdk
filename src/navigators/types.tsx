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
import { AppTileParams } from '../screens';
import { AuthedAppTileParams } from '../screens/AuthedAppTileScreen';
import { MessageTileParams } from '../screens/MessageScreen';
import { DirectMessageParams } from '../screens/DirectMessagesScreen';
import { ComposeMessageParams } from '../screens/ComposeMessageScreen';

export type LoggedInRootParamList = {
  app: NavigatorScreenParams<TabParamList> | undefined;
  'screens/ConsentScreen': undefined;
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
    LoggedInRootScreenProps<keyof LoggedInRootParamList>
  >;

export type HomeStackParamList = {
  Home: undefined;
  'Home/AppTile': AppTileParams;
  'Home/AuthedAppTile': AuthedAppTileParams;
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
  'Home/Messages': MessageTileParams;
  'Home/DirectMessage': DirectMessageParams;
  'Home/ComposeMessage': ComposeMessageParams;
};

export type NotificationsStackParamList = {
  Notifications: undefined;
};

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    StackScreenProps<SettingsStackParamList, T>,
    LoggedInRootScreenProps<keyof LoggedInRootParamList>
  >;

export type SettingsStackParamList = {
  Settings: undefined;
  'Settings/Profile': undefined;
  'Settings/Wearables': undefined;
};

export type Route =
  | keyof LoggedInRootParamList
  | keyof SettingsStackParamList
  | keyof NotificationsStackParamList
  | keyof HomeStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends LoggedInRootParamList {}
  }
}

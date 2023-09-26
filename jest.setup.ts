import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock';
import i18next from './lib/i18n';
import { initReactI18next } from 'react-i18next';
import {
  mockActiveAccount,
  mockActiveConfig,
  mockUseSession,
} from './src/common/testHelpers/mockSession';

jest.mock('react-native-device-info', () => ({
  ...mockDeviceInfo,
  getBundleId: () => 'com.unit-test.app',
}));

jest.mock('./src/common/testID', () => ({
  tID: (id: string) => id,
}));

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    /* Buttons */
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    TouchableOpacity: View,
    /* Other */
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

jest.mock('react-native-notifications', () => ({
  Notifications: {
    getInitialNotification: jest.fn(),
    isRegisteredForRemoteNotifications: jest.fn(),
    registerRemoteNotifications: jest.fn(),
    events: jest.fn(() => ({
      registerRemoteNotificationsRegistered: jest.fn(),
      registerRemoteNotificationsRegistrationDenied: jest.fn(),
      registerRemoteNotificationsRegistrationFailed: jest.fn(),
    })),
  },
  NotificationBackgroundFetchResult: { NEW_DATA: 'NEW_DATA' },
}));

jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn(),
  createNavigationContainerRef: jest.fn(),
}));

beforeAll(async () => {
  // Setup minimal i18next instance
  jest.useRealTimers(); // Required to deal with hook timeout bug
  mockUseSession();
  mockActiveAccount();
  mockActiveConfig();

  return i18next.use(initReactI18next).init({
    fallbackLng: 'en',
    supportedLngs: ['en'],
    react: {
      useSuspense: true,
    },

    ns: ['common'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: {
          // Plurals are an uncommon case where a defaultValue is not provided
          'post-comments_zero': 'COMMENT',
          'post-comments_one': '1 COMMENT',
          'post-comments_other': '{{count}} COMMENTS',
          'post-replies_zero': 'REPLY',
        },
      },
    },
  });
});

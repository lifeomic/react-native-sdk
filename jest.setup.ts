import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock';

jest.mock('react-native-device-info', () => ({
  ...mockDeviceInfo,
  getBundleId: () => 'com.unit-test.app',
}));

jest.mock('./src/common/testID', () => ({
  tID: (id: string) => id,
}));

jest.mock('i18next', () => ({
  use: () => ({
    init: jest.fn(),
  }),
  changeLanguage: jest.fn(),
  t: (_key: string, defaultValue: string, params?: any) =>
    `${defaultValue}${params ? JSON.stringify(params) : ''}`,
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

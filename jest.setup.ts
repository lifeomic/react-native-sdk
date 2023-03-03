// @ts-ignore
import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
// @ts-ignore
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock';

jest.mock('react-native-device-info', () => mockDeviceInfo);

jest.mock('./src/common/testID', () => ({
  tID: (id: string) => id,
}));

jest.mock('i18next', () => ({
  t: (_key: string, defaultValue: string, params?: any) =>
    `${defaultValue}${params ? JSON.stringify(params) : ''}`,
}));

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

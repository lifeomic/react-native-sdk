// @ts-ignore
import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

jest.mock('react-native-device-info', () => mockDeviceInfo);

jest.mock('./src/common/testID', () => ({
  tID: (id: string) => id,
}));

jest.mock('i18next', () => ({
  t: (_key: string, defaultValue: string, params?: any) =>
    `${defaultValue}${params ? JSON.stringify(params) : ''}`,
}));

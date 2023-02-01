// @ts-ignore
import mockDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

jest.mock('react-native-device-info', () => mockDeviceInfo);

jest.mock('./src/common/testID', () => ({
  tID: (id: string) => id,
}));

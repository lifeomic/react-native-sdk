import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import baseDefaultTheme from '../src/components/BrandConfigProvider/theme/base/default';

export * from 'react-native-paper';

export const useTheme = jest.fn().mockReturnValue({
  ...DefaultTheme,
  ...baseDefaultTheme,
});

export const Appbar = {
  Header: jest.fn(),
  BackAction: jest.fn(),
  Action: jest.fn(),
  Content: jest.fn(),
};

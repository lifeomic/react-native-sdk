import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useStyles, useDeveloperConfig } from '../hooks';
import { LoginScreen } from './LoginScreen';

jest.mock('../hooks', () => ({
  useStyles: jest.fn(),
  useDeveloperConfig: jest.fn(),
}));

const useDeveloperConfigMock = useDeveloperConfig as jest.Mock;
const useStylesMock = useStyles as jest.Mock;

beforeEach(() => {
  useStylesMock.mockReturnValue({
    styles: {
      containerView: {},
    },
  });

  useDeveloperConfigMock.mockReturnValue({
    renderCustomLoginScreen: null,
  });
});

const loginScreenInContext = (
  <PaperProvider>
    <LoginScreen />
  </PaperProvider>
);

describe('LoginScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(loginScreenInContext);

    expect(getByText('Login')).toBeDefined();
  });

  it('renders custom login screen when provided', () => {
    const renderCustomLoginScreen = jest
      .fn()
      .mockReturnValue(<Text>Custom Login Screen</Text>);
    useDeveloperConfigMock.mockReturnValue({
      renderCustomLoginScreen,
    });

    const { getByText } = render(loginScreenInContext);

    expect(getByText('Custom Login Screen')).toBeDefined();
  });
});

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useStyles, useDeveloperConfig, usePendingInvite } from '../hooks';
import { LoginScreen } from './LoginScreen';

jest.mock('../hooks', () => ({
  useStyles: jest.fn(),
  useDeveloperConfig: jest.fn(),
  usePendingInvite: jest.fn(),
}));

const useDeveloperConfigMock = useDeveloperConfig as jest.Mock;
const useStylesMock = useStyles as jest.Mock;
const usePendingInviteMock = usePendingInvite as jest.Mock;

beforeEach(() => {
  useStylesMock.mockReturnValue({
    styles: {
      containerView: {},
    },
  });

  useDeveloperConfigMock.mockReturnValue({
    renderCustomLoginScreen: null,
  });

  usePendingInviteMock.mockReturnValue({
    inviteParams: undefined,
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

  it('renders accept invite if inviteID present', () => {
    usePendingInviteMock.mockReturnValue({
      inviteParams: {
        inviteId: 'someInviteId',
      },
    });
    const { getByText } = render(loginScreenInContext);
    expect(getByText('Accept Invite')).toBeDefined();
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

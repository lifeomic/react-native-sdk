import React from 'react';
import { Text } from 'react-native';
import { render, act } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { useStyles, useDeveloperConfig, usePendingInvite } from '../hooks';
import { LoginScreen } from './LoginScreen';
import * as OAuthLoginButtonModule from '../components/OAuthLoginButton';

jest.mock('../hooks', () => ({
  useStyles: jest.fn(),
  useDeveloperConfig: jest.fn(),
  usePendingInvite: jest.fn(),
}));
jest.mock('react-native-paper', () => {
  const Dialog = ({ visible, children }: any) => visible && children;
  Dialog.Icon = jest.fn();
  Dialog.Title = Text;
  Dialog.Content = ({ children }: any) => children;

  return {
    ...jest.requireActual('react-native-paper'),
    Dialog,
  };
});

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

  it('renders an error when onFail is called', () => {
    const oAuthLoginButtonSpy = jest.spyOn(
      OAuthLoginButtonModule,
      'OAuthLoginButton',
    );

    const { findByText } = render(loginScreenInContext);

    expect(oAuthLoginButtonSpy).toHaveBeenCalledTimes(1);

    const onFail = oAuthLoginButtonSpy.mock.calls[0][0].onFail!;

    act(() => {
      onFail('Fake error');
    });

    expect(findByText('Authentication Error')).toBeDefined();
    expect(
      findByText('We encountered an error trying to log you in.'),
    ).toBeDefined();
  });

  const NON_ERRORING_FAILURE_MESSAGES = [
    'User cancelled flow',
    "The operation couldn't be completed. (org.openid.appauth.general error -3.)",
  ];

  test.each(NON_ERRORING_FAILURE_MESSAGES)(
    'does not render an error when onFail is called with a %p event',
    (errorMessage) => {
      const oAuthLoginButtonSpy = jest.spyOn(
        OAuthLoginButtonModule,
        'OAuthLoginButton',
      );

      const { queryByText } = render(loginScreenInContext);

      expect(oAuthLoginButtonSpy).toHaveBeenCalledTimes(1);

      const onFail = oAuthLoginButtonSpy.mock.calls[0][0].onFail!;

      act(() => {
        onFail(errorMessage);
      });

      expect(queryByText('Authentication Error')).toBeNull();
    },
  );
});

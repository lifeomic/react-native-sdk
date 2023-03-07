import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { OAuthLogoutButton } from './OAuthLogoutButton';
import { useAuth } from '../hooks/useAuth';
import { useOAuthFlow } from '../hooks/useOAuthFlow';

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../hooks/useOAuthFlow', () => ({
  useOAuthFlow: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;
const useOAuthFlowMock = useOAuthFlow as jest.Mock;
const logoutMock = jest.fn();
const onSuccess = jest.fn();
const onFail = jest.fn();

beforeEach(() => {
  useAuthMock.mockReturnValue({
    isLoggedIn: true,
  });
  useOAuthFlowMock.mockReturnValue({
    logout: logoutMock,
  });
});

test('renders', () => {
  const screen = render(
    <OAuthLogoutButton onSuccess={onSuccess} onFail={onFail} label="logout" />,
  );
  expect(screen.getByTestId('oauth-logout-button')).toBeDefined();
});

test('logout utilizes useOAuthFlow', async () => {
  const screen = render(
    <OAuthLogoutButton onSuccess={onSuccess} onFail={onFail} label="logout" />,
  );
  await waitFor(async () => {
    const logoutButton = screen.getByTestId('oauth-logout-button');
    await fireEvent.press(logoutButton);
  });
  expect(logoutMock).toHaveBeenCalledWith({
    onSuccess,
    onFail,
  });
});

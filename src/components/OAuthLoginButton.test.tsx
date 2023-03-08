import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { OAuthLoginButton } from './OAuthLoginButton';
import { useOAuthFlow } from '../hooks/useOAuthFlow';

jest.mock('../hooks/useOAuthFlow', () => ({
  useOAuthFlow: jest.fn(),
}));

const useOAuthFlowMock = useOAuthFlow as jest.Mock;
const loginMock = jest.fn();
const onSuccess = jest.fn();
const onFail = jest.fn();

beforeEach(() => {
  useOAuthFlowMock.mockReturnValue({
    login: loginMock,
  });
});

test('renders', () => {
  const screen = render(
    <OAuthLoginButton onSuccess={onSuccess} onFail={onFail} label="login" />,
  );
  expect(screen.getByTestId('button')).toBeDefined();
});

test('login utilizes useOAuthFlow', async () => {
  const screen = render(
    <OAuthLoginButton onSuccess={onSuccess} onFail={onFail} label="login" />,
  );
  await waitFor(async () => {
    const loginButton = screen.getByTestId('button');
    await fireEvent.press(loginButton);
  });
  expect(loginMock).toHaveBeenCalledWith({
    onSuccess,
    onFail,
  });
});

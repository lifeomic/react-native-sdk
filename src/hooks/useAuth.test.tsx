import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthContextProvider, AuthResult, useAuth } from './useAuth';
import Keychain from 'react-native-keychain';
import { unusedUsername } from '../common/SecureStore';

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK' },
  SECURITY_LEVEL: { SECURE_SOFTWARE: 'SECURE_SOFTWARE' },
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
}));

jest.mock('jwt-decode', () => () => ({ 'cognito:username': 'userId' }));

const keychainMock = Keychain as jest.Mocked<typeof Keychain>;

const renderHookInContext = async () => {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    ),
  });
};

const exampleAuthResult: AuthResult = {
  tokenType: 'bearer',
  accessTokenExpirationDate: new Date().toISOString(),
  accessToken: 'accessToken',
  idToken: 'idToken',
  refreshToken: 'refreshToken',
};

beforeEach(() => {
  keychainMock.getGenericPassword.mockResolvedValue(false);
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useAuth());
  await expect(result.current.initialize()).rejects.toBeUndefined();
  await expect(
    result.current.storeAuthResult(exampleAuthResult),
  ).rejects.toBeUndefined();
  await expect(result.current.clearAuthResult()).rejects.toBeUndefined();
});

test('initial state test', async () => {
  const { result } = await renderHookInContext();

  expect(result.current.loading).toBe(true);
  expect(result.current.authResult).toBeUndefined();
  expect(result.current.isLoggedIn).toBe(false);
});

test('stores token and updates state', async () => {
  const { result } = await renderHookInContext();

  await act(async () => {
    await result.current.storeAuthResult(exampleAuthResult);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(exampleAuthResult);
  expect(result.current.isLoggedIn).toBe(true);
  expect(result.current.username).toBe('userId');
  expect(keychainMock.setGenericPassword).toHaveBeenCalledWith(
    unusedUsername,
    JSON.stringify(exampleAuthResult),
    expect.anything(),
  );
});

test('clears token and updates state', async () => {
  const { result } = await renderHookInContext();
  await act(async () => {
    await result.current.storeAuthResult(exampleAuthResult);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(exampleAuthResult);
  expect(result.current.isLoggedIn).toBe(true);

  await act(async () => {
    await result.current.clearAuthResult();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toBeUndefined();
  expect(result.current.isLoggedIn).toBe(false);
  expect(keychainMock.resetGenericPassword).toHaveBeenCalled();
});

test('initialize loads token and updates state', async () => {
  const authResult = {
    ...exampleAuthResult,
    accessTokenExpirationDate: new Date(
      Date.now() + 1 * 60 * 60 * 1000,
    ).toISOString(),
  };
  keychainMock.getGenericPassword.mockResolvedValue({
    username: 'auth-result',
    password: JSON.stringify(authResult),
    service: 'any',
    storage: 'any',
  });
  const { result } = await renderHookInContext();
  expect(result.current.loading).toBe(true);

  await act(async () => {
    await result.current.initialize();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(authResult);
  expect(result.current.isLoggedIn).toBe(true);
  expect(result.current.username).toBe('userId');
});

test('initialize can handle password retrieval error', async () => {
  const error = new Error('uh oh');
  keychainMock.getGenericPassword.mockRejectedValue(error);
  const { result } = await renderHookInContext();
  expect(result.current.loading).toBe(true);

  await act(async () => {
    await result.current.initialize();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toBeUndefined();
  expect(result.current.isLoggedIn).toBe(false);
});

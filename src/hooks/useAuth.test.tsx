import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthContextProvider, AuthResult, useAuth } from './useAuth';
import Keychain from 'react-native-keychain';

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK' },
  SECURITY_LEVEL: { SECURE_SOFTWARE: 'SECURE_SOFTWARE' },
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

const keychainMock = Keychain as jest.Mocked<typeof Keychain>;

const renderHookInContext = async () => {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    ),
  });
};

test('initial state test', async () => {
  const { result } = await renderHookInContext();

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toBeUndefined();
  expect(result.current.isLoggedIn).toBe(false);
});

test('stores token and updates state', async () => {
  const { result } = await renderHookInContext();
  const authResult: AuthResult = {
    tokenType: 'bearer',
    accessTokenExpirationDate: new Date().toISOString(),
    accessToken: 'accessToken',
    idToken: 'idToken',
    refreshToken: 'refreshToken',
  };

  await act(async () => {
    await result.current.storeAuthResult(authResult);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(authResult);
  expect(result.current.isLoggedIn).toBe(true);
  expect(keychainMock.setGenericPassword).toHaveBeenCalledWith(
    'auth-result',
    JSON.stringify(authResult),
    expect.anything(),
  );
});

test('clears token and updates state', async () => {
  const { result } = await renderHookInContext();
  const authResult: AuthResult = {
    tokenType: 'bearer',
    accessTokenExpirationDate: new Date().toISOString(),
    accessToken: 'accessToken',
    idToken: 'idToken',
    refreshToken: 'refreshToken',
  };
  await act(async () => {
    await result.current.storeAuthResult(authResult);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(authResult);
  expect(result.current.isLoggedIn).toBe(true);

  await act(async () => {
    await await result.current.clearAuthResult();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toBeUndefined();
  expect(result.current.isLoggedIn).toBe(false);
  expect(keychainMock.resetGenericPassword).toHaveBeenCalled();
});

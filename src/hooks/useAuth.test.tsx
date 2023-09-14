import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  AuthContextProvider,
  AuthResult,
  shouldAttemptTokenRefresh,
  useAuth,
} from './useAuth';
import Keychain from 'react-native-keychain';
import { unusedUsername } from '../common/SecureStore';
import { useCurrentAppState } from './useCurrentAppState';
import { AxiosError } from 'axios';

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK' },
  SECURITY_LEVEL: { SECURE_SOFTWARE: 'SECURE_SOFTWARE' },
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
}));
jest.mock('./useCurrentAppState', () => ({
  useCurrentAppState: jest.fn(),
}));

const useCurrentAppStateMock = useCurrentAppState as jest.Mock;
const keychainMock = Keychain as jest.Mocked<typeof Keychain>;

function mockAuthResult(authResult: AuthResult) {
  keychainMock.getGenericPassword.mockResolvedValue({
    username: 'auth-result',
    password: JSON.stringify(authResult),
    service: 'any',
    storage: 'any',
  });
}

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

const refreshHandler = jest.fn();

beforeEach(() => {
  keychainMock.getGenericPassword.mockResolvedValue(false);
  useCurrentAppStateMock.mockReturnValue({
    currentAppState: 'active',
  });
  jest.useRealTimers();
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useAuth());
  await expect(
    result.current.initialize(refreshHandler),
  ).rejects.toBeUndefined();
  await expect(
    result.current.storeAuthResult(exampleAuthResult),
  ).rejects.toBeUndefined();
  await expect(result.current.clearAuthResult()).rejects.toBeUndefined();
  await expect(
    result.current.refreshForAuthFailure(new Error() as AxiosError),
  ).rejects.toBeUndefined();
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

describe('initialize', () => {
  test('loads token and updates state', async () => {
    const authResult = {
      ...exampleAuthResult,
      accessTokenExpirationDate: new Date(
        Date.now() + 1 * 60 * 60 * 1000,
      ).toISOString(), // Expires in 1 hour, should be good
    };
    mockAuthResult(authResult);
    const { result } = await renderHookInContext();
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await result.current.initialize(refreshHandler);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.authResult).toEqual(authResult);
    expect(result.current.isLoggedIn).toBe(true);
    expect(refreshHandler).not.toHaveBeenCalled();
  });

  test('can handle password retrieval error', async () => {
    const error = new Error('uh oh');
    keychainMock.getGenericPassword.mockRejectedValue(error);
    const { result } = await renderHookInContext();
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await result.current.initialize(refreshHandler);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.authResult).toBeUndefined();
    expect(result.current.isLoggedIn).toBe(false);
  });

  test('refreshes accessToken immediately if needed', async () => {
    const authResult = {
      ...exampleAuthResult,
      accessTokenExpirationDate: new Date(
        Date.now() + 5 * 60 * 1000,
      ).toISOString(), // Expires in 5 minutes!
    };
    mockAuthResult(authResult);
    const { result } = await renderHookInContext();
    expect(result.current.loading).toBe(true);
    expect(result.current.isLoggedIn).toBe(false);

    const refreshedAuthResult = {
      ...exampleAuthResult,
      accessToken: 'REFRESHED_accessToken',
      idToken: 'REFRESHED_idToken',
      refreshToken: 'REFRESHED_refreshToken',
      accessTokenExpirationDate: new Date(
        Date.now() + 60 * 60 * 1000,
      ).toISOString(), // Expires in 1 hour
    };
    refreshHandler.mockResolvedValue(refreshedAuthResult);
    await act(async () => {
      await result.current.initialize(refreshHandler);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.authResult).toEqual(refreshedAuthResult);
    expect(result.current.isLoggedIn).toBe(true);
  });

  test('refresh does not lose original refreshToken', async () => {
    const authResult = {
      ...exampleAuthResult,
      accessTokenExpirationDate: new Date(
        Date.now() + 5 * 60 * 1000,
      ).toISOString(),
    };
    mockAuthResult(authResult);
    const { result } = await renderHookInContext();

    const refreshedAuthResult = {
      ...exampleAuthResult,
      accessToken: 'REFRESHED_accessToken',
      idToken: 'REFRESHED_idToken',
      accessTokenExpirationDate: new Date(
        Date.now() + 60 * 60 * 1000,
      ).toISOString(),
      refreshToken: '', // NOTE: purpose of test
    };
    refreshHandler.mockResolvedValue(refreshedAuthResult);
    await act(async () => {
      await result.current.initialize(refreshHandler);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.authResult).toEqual({
      ...refreshedAuthResult,
      refreshToken: exampleAuthResult.refreshToken, // NOTE: purpose of test
    });
    expect(result.current.isLoggedIn).toBe(true);
  });

  test('refresh clears auth storage if it fails', async () => {
    const authResult = {
      ...exampleAuthResult,
      accessTokenExpirationDate: new Date(
        Date.now() + 5 * 60 * 1000,
      ).toISOString(),
    };
    mockAuthResult(authResult);
    const { result } = await renderHookInContext();

    refreshHandler.mockRejectedValue(new Error('auth service down'));
    await act(async () => {
      await result.current.initialize(refreshHandler);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.authResult).toBeUndefined();
    expect(result.current.isLoggedIn).toBe(false);
    expect(keychainMock.resetGenericPassword).toHaveBeenCalled();
  });
});

test('app state change refreshes auth token if needed', async () => {
  // 1. Get refreshHandler registered, and non-expiring token in state.
  const authResult = {
    ...exampleAuthResult,
    accessTokenExpirationDate: new Date(
      Date.now() + 60 * 60 * 1000,
    ).toISOString(),
  };
  mockAuthResult(authResult);
  useCurrentAppStateMock.mockReturnValue({
    currentAppState: 'background',
  });
  const { result, rerender } = await renderHookInContext();
  await act(async () => {
    await result.current.initialize(refreshHandler);
  });
  expect(refreshHandler).not.toHaveBeenCalled();

  // 2. Sneak an expiring token into state.
  const expiringAuthResult = {
    ...exampleAuthResult,
    accessTokenExpirationDate: new Date(
      Date.now() + 5 * 60 * 1000,
    ).toISOString(), // Expires soon ...
  };
  await act(async () => {
    await result.current.storeAuthResult(expiringAuthResult);
  });
  expect(refreshHandler).not.toHaveBeenCalled();

  // 3. Finally, go from background to active app state
  const refreshedAuthResult = {
    ...exampleAuthResult,
    accessToken: 'REFRESHED_accessToken',
    idToken: 'REFRESHED_idToken',
    refreshToken: 'REFRESHED_refreshToken',
    accessTokenExpirationDate: new Date(
      Date.now() + 60 * 60 * 1000,
    ).toISOString(), // Expires in 1 hour
  };
  await act(async () => {
    refreshHandler.mockResolvedValue(refreshedAuthResult);
    useCurrentAppStateMock.mockReturnValue({
      currentAppState: 'active',
    });
    rerender({});
  });
  expect(refreshHandler).toHaveBeenCalledWith(expiringAuthResult);

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(refreshedAuthResult);
  expect(result.current.isLoggedIn).toBe(true);
});

test('shouldAttemptTokenRefresh handles edge case of accessTokenExpirationDate not being set', () => {
  expect(shouldAttemptTokenRefresh(undefined)).toBe(false);
});

test('refreshForAuthFailure refreshes auth token if not already loading', async () => {
  // 1. Setup being initialized and authorized
  const authResult = {
    ...exampleAuthResult,
    accessTokenExpirationDate: new Date(
      Date.now() + 60 * 60 * 1000,
    ).toISOString(),
  };
  mockAuthResult(authResult);
  const { result } = await renderHookInContext();
  await act(async () => {
    await result.current.initialize(refreshHandler);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(authResult);
  expect(result.current.isLoggedIn).toBe(true);
  expect(refreshHandler).not.toHaveBeenCalled();

  // 2. Simulate reporting a 401 error
  const refreshedAuthResult = {
    ...exampleAuthResult,
    accessToken: 'REFRESHED_accessToken',
    idToken: 'REFRESHED_idToken',
    refreshToken: 'REFRESHED_refreshToken',
    accessTokenExpirationDate: new Date(
      Date.now() + 60 * 60 * 1000,
    ).toISOString(), // Expires in 1 hour
  };
  refreshHandler.mockResolvedValue(
    new Promise((resolve) =>
      process.nextTick(() => resolve(refreshedAuthResult)),
    ),
  );
  jest.useFakeTimers();
  act(() => {
    result.current.refreshForAuthFailure(new Error() as AxiosError);
  });
  expect(refreshHandler).toHaveBeenCalledTimes(1);
  expect(result.current.loading).toBe(true);

  // 3. 401 reports have no effect while still loading
  await act(async () => {
    await result.current.refreshForAuthFailure(new Error() as AxiosError);
  });
  expect(refreshHandler).toHaveBeenCalledTimes(1);

  // 4. Resolve refreshHandler inside act so hook can "react"
  await act(async () => {
    jest.runAllTimers();
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.authResult).toEqual(refreshedAuthResult);
  expect(result.current.isLoggedIn).toBe(true);
});

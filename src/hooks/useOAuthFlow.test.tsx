import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import { OAuthContextProvider, useOAuthFlow } from './useOAuthFlow';
import { AuthResult, useAuth } from './useAuth';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(),
  refresh: jest.fn(),
  revoke: jest.fn(),
}));
jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;
const authorizeMock = authorize as jest.Mock;
const refreshMock = refresh as jest.Mock;
const revokeMock = revoke as jest.Mock;
const storeAuthResultMock = jest.fn();
const clearAuthResultMock = jest.fn();
const useAuthInitialize = jest.fn();

const authConfig = {
  clientId: 'clientId',
  redirectUrl: 'http://localhost/redirect',
  serviceConfiguration: {
    authorizationEndpoint: 'http://localhost/authorize',
    tokenEndpoint: 'http://localhost/token',
    revocationEndpoint: 'http://localhost/revoke',
  },
  scopes: ['openid'],
  usePKCE: true,
};

const authResult: AuthResult = {
  tokenType: 'bearer',
  accessTokenExpirationDate: new Date().toISOString(),
  accessToken: 'accessToken',
  idToken: 'idToken',
  refreshToken: 'refreshToken',
};

const renderHookInContext = async () => {
  return renderHook(() => useOAuthFlow(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <OAuthContextProvider authConfig={authConfig}>
          {children}
        </OAuthContextProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useAuthMock.mockReturnValue({
    isLoggedIn: true,
    authResult: authResult,
    storeAuthResult: storeAuthResultMock,
    clearAuthResult: clearAuthResultMock,
    initialize: useAuthInitialize,
  });

  authorizeMock.mockResolvedValue(authResult);
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useOAuthFlow());
  await expect(result.current.login({})).rejects.toBeUndefined();
  await expect(result.current.logout({})).rejects.toBeUndefined();
});

test('initial state test', async () => {
  const { result } = await renderHookInContext();
  expect(result.current.authConfig).toEqual(authConfig);
});

test('overrides usePKCE to true', async () => {
  const newAuthConfig = {
    ...authConfig,
    usePKCE: false,
  };
  const { result } = await renderHook(() => useOAuthFlow(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <OAuthContextProvider authConfig={newAuthConfig}>
          {children}
        </OAuthContextProvider>
      </QueryClientProvider>
    ),
  });
  expect(result.current.authConfig).toEqual(authConfig);
});

describe('login', () => {
  test('utilizes authorize and storeAuthResult', async () => {
    const { result } = await renderHookInContext();
    const onSuccess = jest.fn();
    await act(async () => {
      await result.current.login({
        onSuccess,
        onFail: jest.fn(),
      });
    });
    expect(authorize).toHaveBeenCalledWith(authConfig);
    expect(storeAuthResultMock).toHaveBeenCalledWith(authResult);
    expect(onSuccess).toHaveBeenCalledWith(authResult);
  });

  test('upon error, clears storage and reports error', async () => {
    const { result } = await renderHookInContext();
    const onFail = jest.fn();
    const error = new Error('login fail');
    authorizeMock.mockRejectedValue(error);
    await act(async () => {
      await result.current.login({
        onSuccess: jest.fn(),
        onFail,
      });
    });
    expect(storeAuthResultMock).not.toHaveBeenCalled();
    expect(clearAuthResultMock).toHaveBeenCalled();
    expect(onFail).toHaveBeenCalledWith(error);
  });
});

describe('logout', () => {
  test('utilizes revoke and clearAuthResult', async () => {
    const { result } = await renderHookInContext();
    const onSuccess = jest.fn();
    await act(async () => {
      await result.current.logout({
        onSuccess,
        onFail: jest.fn(),
      });
    });
    expect(revoke).toHaveBeenCalled();
    expect(clearAuthResultMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith();
  });

  test('upon error, still clears storage and reports error', async () => {
    const { result } = await renderHookInContext();
    const onFail = jest.fn();
    const error = new Error('logout fail');
    revokeMock.mockRejectedValue(error);
    await act(async () => {
      await result.current.logout({
        onSuccess: jest.fn(),
        onFail,
      });
    });
    expect(clearAuthResultMock).toHaveBeenCalled();
    expect(onFail).toHaveBeenCalledWith(error);
  });

  test('invokes onSuccess early if isLoggedIn=false, still clearing storage', async () => {
    useAuthMock.mockReturnValue({
      isLoggedIn: false,
      authResult: undefined,
      storeAuthResult: storeAuthResultMock,
      clearAuthResult: clearAuthResultMock,
      initialize: jest.fn(),
    });
    const { result } = await renderHookInContext();
    const onSuccess = jest.fn();
    await act(async () => {
      await result.current.logout({
        onSuccess,
        onFail: jest.fn(),
      });
    });
    expect(revoke).not.toHaveBeenCalled();
    expect(clearAuthResultMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith();
  });
});

describe('refreshHandler', () => {
  test('calls useAuth with refreshHandler that utilizes refresh method', async () => {
    await renderHookInContext();
    expect(useAuthInitialize).toHaveBeenCalled();

    const refreshHandler = useAuthInitialize.mock.calls[0][0];
    await act(async () => {
      await refreshHandler({ refreshToken: 'refresh-token' });
    });

    expect(refreshMock).toHaveBeenCalledWith(authConfig, {
      refreshToken: 'refresh-token',
    });
  });

  test('throws if no refreshToken provided', async () => {
    await renderHookInContext();
    expect(useAuthInitialize).toHaveBeenCalled();

    const refreshHandler = useAuthInitialize.mock.calls[0][0];
    await act(async () => {
      await expect(refreshHandler).rejects.toThrow();
    });
  });
});

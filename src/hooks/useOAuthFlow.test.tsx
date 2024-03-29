import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  AuthConfiguration,
  authorize,
  refresh,
  revoke,
} from 'react-native-app-auth';
import {
  AuthConfigGetter,
  OAuthContextProvider,
  useOAuthFlow,
} from './useOAuthFlow';
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

const renderHookInContext = (
  props: {
    authConfig?: AuthConfiguration | AuthConfigGetter;
  } = { authConfig },
) => {
  return renderHook(() => useOAuthFlow(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <OAuthContextProvider authConfig={props.authConfig || authConfig}>
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
  const { result } = renderHookInContext();
  expect(result.current.authConfig).toEqual(authConfig);
});

test('overrides usePKCE to true', async () => {
  const { result } = renderHookInContext({
    authConfig: {
      ...authConfig,
      usePKCE: false,
    },
  });

  expect(result.current.authConfig).toEqual(authConfig);
});

test('allows for providing auth config as a function', () => {
  const additionalParameters = {
    customParameter: 'custom-parameter',
  };
  const authConfigFn: AuthConfigGetter = jest.fn(() => ({
    ...authConfig,
    usePKCE: false,
    additionalParameters,
  }));

  const { result } = renderHookInContext({
    authConfig: authConfigFn,
  });

  expect(authConfigFn).toHaveBeenCalledTimes(1);
  expect(authConfigFn).toHaveBeenCalledWith(authResult.accessToken);
  expect(result.current.authConfig).toEqual({
    ...authConfig,
    additionalParameters,
  });
});

describe('login', () => {
  test('utilizes authorize and storeAuthResult', async () => {
    const { result } = renderHookInContext();
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
    const { result } = renderHookInContext();
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
    const { result } = renderHookInContext();
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
    const { result } = renderHookInContext();
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
    const { result } = renderHookInContext();
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
    renderHookInContext();
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
    renderHookInContext();
    expect(useAuthInitialize).toHaveBeenCalled();

    const refreshHandler = useAuthInitialize.mock.calls[0][0];
    await act(async () => {
      await expect(refreshHandler).rejects.toThrow();
    });
  });
});

import React from 'react';
import axios from 'axios';
import { act, renderHook } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { AuthResult, useAuth } from './useAuth';
import { HttpClientContextProvider, useHttpClient } from './useHttpClient';
import { ActiveAccountProvider } from './useActiveAccount';

jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;

const authResult: AuthResult = {
  tokenType: 'bearer',
  accessTokenExpirationDate: new Date().toISOString(),
  accessToken: 'accessToken',
  idToken: 'idToken',
  refreshToken: 'refreshToken',
};

const renderHookInContext = async () => {
  return renderHook(() => useHttpClient(), {
    wrapper: ({ children }) => (
      <ActiveAccountProvider account="mockaccount">
        <HttpClientContextProvider baseURL="http://localhost/unit-test">
          {children}
        </HttpClientContextProvider>
      </ActiveAccountProvider>
    ),
  });
};

beforeEach(() => {
  useAuthMock.mockReturnValue({});
});

test('initial state test', async () => {
  const { result } = await renderHookInContext();
  expect(result.current.httpClient).toBeDefined();
});

test('provides default baseURL if one is not provided', async () => {
  const axiosInstance = axios.create();
  const { result } = renderHook(() => useHttpClient(), {
    wrapper: ({ children }) => (
      <ActiveAccountProvider account="mockaccount">
        <HttpClientContextProvider injectedAxiosInstance={axiosInstance}>
          {children}
        </HttpClientContextProvider>
      </ActiveAccountProvider>
    ),
  });
  expect(result.current.httpClient.defaults.baseURL).toEqual(
    'https://api.us.lifeomic.com',
  );
});

test('if authResult is not present, has no Authorization header', async () => {
  const { result } = await renderHookInContext();
  const axiosMock = new MockAdapter(result.current.httpClient);
  axiosMock.onGet('/v1/unauthenticated-request').reply(200);
  await result.current.httpClient.get('/v1/unauthenticated-request');

  const getHeaders = axiosMock.history.get[0].headers;
  expect(getHeaders?.Authorization).toBeUndefined();
  expect(getHeaders?.['Content-Type']).toBe('application/json');
});

test('once authResult is set, adds bearer token and account header', async () => {
  const { result, rerender } = await renderHookInContext();

  act(() => {
    useAuthMock.mockReturnValue({ authResult });
    rerender({});
  });

  const axiosMock = new MockAdapter(result.current.httpClient);
  axiosMock.onGet('/v1/accounts').reply(200);
  await result.current.httpClient.get('/v1/accounts');

  const getHeaders = axiosMock.history.get[0].headers;
  expect(getHeaders?.Authorization).toBe(`Bearer ${authResult.accessToken}`);
  expect(getHeaders?.['LifeOmic-Account']).toBe('mockaccount');
  expect(getHeaders?.['Content-Type']).toBe('application/json');
});

test('reports 401 errors to useAuth and throws', async () => {
  const refreshForAuthFailure = jest.fn().mockResolvedValue({});
  useAuthMock.mockReturnValue({ authResult, refreshForAuthFailure });
  const { result } = await renderHookInContext();

  const axiosMock = new MockAdapter(result.current.httpClient);
  axiosMock.onGet('/v1/accounts').reply(401);
  await expect(result.current.httpClient.get('/v1/accounts')).rejects.toThrow();
  expect(refreshForAuthFailure).toHaveBeenCalled();
});

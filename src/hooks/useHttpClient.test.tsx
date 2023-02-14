import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { AuthResult, useAuth } from './useAuth';
import { HttpClientContextProvider, useHttpClient } from './useHttpClient';

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
      <HttpClientContextProvider baseURL="http://localhost/unit-test">
        {children}
      </HttpClientContextProvider>
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

test('if authResult is not present, has no Authorization header', async () => {
  const { result } = await renderHookInContext();
  const axiosMock = new MockAdapter(result.current.httpClient);
  axiosMock.onGet('/v1/unauthenticated-request').reply(200);
  await result.current.httpClient.get('/v1/unauthenticated-request');

  const getHeaders = axiosMock.history.get[0].headers;
  expect(getHeaders?.Authorization).toBeUndefined();
  expect(getHeaders?.['Content-Type']).toBe('application/json');
});

test('once authResult is set, adds bearer token', async () => {
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
  expect(getHeaders?.['Content-Type']).toBe('application/json');
});

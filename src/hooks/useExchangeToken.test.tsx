import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { useHttpClient } from './useHttpClient';
import { useAuth } from './useAuth';
import { ExchangeResult, useExchangeToken } from './useExchangeToken';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));
jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

const useHttpClientMock = useHttpClient as jest.Mock;
const useAuthMock = useAuth as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useExchangeToken('someAppTileId', 'someClientId'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
  useAuthMock.mockReturnValue({
    authResult: {
      accessToken: 'someToken',
    },
  });
});

test('posts token/clientId to /v1/client-tokens', async () => {
  axiosMock.onPost('/v1/client-tokens').reply<ExchangeResult>(200, {
    code: 'some-code',
  });
  const { result } = await renderHookInContext();
  await waitFor(() => result.current.isSuccess === true);
  expect(axiosMock.history.post[0].url).toBe('/v1/client-tokens');
  expect(axiosMock.history.post[0].data).toBe(
    JSON.stringify({
      accessToken: 'someToken',
      targetClientId: 'someClientId',
    }),
  );
  await waitFor(() => {
    expect(result.current.data).toEqual({ code: 'some-code' });
  });
});

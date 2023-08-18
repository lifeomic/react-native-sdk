import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from './useAuth';
import { useAccounts } from './useAccounts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { useHttpClient } from './useHttpClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useAccounts(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useAuthMock.mockReturnValue({
    authResult: { accessToken: 'accessToken' },
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
});

test('fetches and parses accounts', async () => {
  const accounts = [{ id: 'accountid' }];
  axiosMock.onGet('/v1/accounts').reply(200, {
    accounts,
  });
  const { result } = await renderHookInContext();
  await waitFor(() => result.current.isSuccess);
  expect(axiosMock.history.get[0].url).toBe('/v1/accounts');
  await waitFor(() => expect(result.current.data).toEqual(accounts));
});

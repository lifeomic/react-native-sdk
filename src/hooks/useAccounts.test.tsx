import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from './useAuth';
import { useAccounts } from './useAccounts';
import { QueryClient, QueryClientProvider } from 'react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { useAPIClients } from './useAPIClients';

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
jest.mock('./useAPIClients', () => ({
  useAPIClients: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;
const useAPIClientsMock = useAPIClients as jest.Mock;

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
  useAPIClientsMock.mockReturnValue({ httpClient: axiosInstance });
});

test('fetches accounts', async () => {
  axiosMock.onGet('/v1/accounts').reply(200, {
    accounts: [],
  });
  const { result } = await renderHookInContext();
  await waitFor(() => result.current.isSuccess);

  expect(axiosMock.history.get[0].url).toBe('/v1/accounts');
});

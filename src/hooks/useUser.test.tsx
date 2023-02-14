import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useAuth } from './useAuth';
import { useUser } from './useUser';
import { QueryClient, QueryClientProvider } from 'react-query';
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
  return renderHook(() => useUser(), {
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

test('fetches and parses user', async () => {
  const userProfile = { id: 'id', profile: {} };
  axiosMock.onGet('/v1/user').reply(200, userProfile);
  const { result } = await renderHookInContext();
  await waitFor(() => result.current.isSuccess);
  expect(axiosMock.history.get[0].url).toBe('/v1/user');
  await waitFor(() => expect(result.current.data).toEqual(userProfile));
});

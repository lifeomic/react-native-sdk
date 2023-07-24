import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { useFeature } from './useFeature';
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

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const renderHookInContext = async (feature: string) => {
  return renderHook(useFeature, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
    initialProps: feature,
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { 'LifeOmic-Account': 'acct1' },
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
});

test('fetches the feature flag', async () => {
  axiosMock.onGet('/v1/features/test').reply(200, {
    test: true,
  });

  const { result } = await renderHookInContext('test');

  await waitFor(() => result.current.isSuccess);
  expect(axiosMock.history.get[0].url).toBe('/v1/features/test');
  await waitFor(() => expect(result.current.data).toEqual(true));
});
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAsyncStorage } from './useAsyncStorage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderHookInContext = async (key: string) => {
  return renderHook(() => useAsyncStorage(key), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

describe('useAsyncStorage', () => {
  test('configured appTiles are returned', async () => {
    queryClient.setQueryData(['async-storage-get', 'key'], () => 'test');

    const { result } = await renderHookInContext('key');

    await waitFor(() => {
      expect(result.current[0].data).toEqual('test');
    });

    await act(async () => {
      await result.current[1]('new-value');
    });

    await waitFor(() => {
      expect(result.current[0].data).toEqual('new-value');
    });

    await act(async () => {
      await result.current[1]('new-value');
    });

    expect(result.current[0].data).toEqual('new-value');
  });
});

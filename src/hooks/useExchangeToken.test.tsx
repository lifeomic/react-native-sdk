import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExchangeToken } from './useExchangeToken';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const api = createRestAPIMock();

const renderHookInContext = async () => {
  return renderHook(() => useExchangeToken('someAppTileId', 'someClientId'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

test('posts token/clientId to /v1/client-tokens', async () => {
  const mock = jest.fn();
  api.mock(
    'POST /v1/client-tokens',
    mock.mockReturnValue({ status: 200, data: { code: 'some-code' } }),
  );
  const { result } = await renderHookInContext();
  await waitFor(() => {
    expect(result.current.status).toEqual('success');
    expect(result.current.data?.code).toStrictEqual('some-code');
  });

  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith({
    body: { targetClientId: 'someClientId' },
    headers: expect.objectContaining({}),
    params: {},
  });
});

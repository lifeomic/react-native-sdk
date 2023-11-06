import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
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

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useExchangeToken('someAppTileId', 'someClientId'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { 'LifeOmic-Account': 'acct1' },
  });
});

test('posts token/clientId to /v1/client-tokens', async () => {
  const mock = jest.fn();
  api.mock(
    'POST /v1/client-tokens',
    mock.mockReturnValue({ status: 200, data: { code: 'some-code' } }),
  );
  const { result } = await renderHookInContext();
  await waitFor(() => {
    expect(result.current.status === 'success');
    expect(result.current.data?.code).toStrictEqual('some-code');
  });

  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock).toHaveBeenCalledWith({
    body: { targetClientId: 'someClientId' },
    headers: expect.objectContaining({
      'lifeomic-account': 'acct1',
    }),
    params: {},
  });
});

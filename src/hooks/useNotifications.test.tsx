import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { useUser } from './useUser';
import {
  NotificationQueryResponse,
  useNotifications,
} from './useNotifications';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from './useGraphQLClient';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

jest.mock('./useUser', () => ({
  useUser: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const renderHookWithInjectedClient = async () => {
  return renderHook(() => useNotifications(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
  });
};

const useUserMock = useUser as jest.Mock;
const useActiveAccountMock = useActiveAccount as jest.Mock;

beforeEach(() => {
  useUserMock.mockReturnValue({
    data: {
      id: 'userId',
      profile: {},
    },
    isLoading: false,
  });
  useActiveAccountMock.mockReturnValue({
    accountHeaders: {
      'LifeOmic-Account': 'unittest',
    },
  });
});

test('returns query result', async () => {
  const notificationResponse: NotificationQueryResponse = {
    notificationsForUser: {
      edges: [],
    },
  };
  const scope = mockGraphQLResponse(
    `${baseURL}/v1/graphql`,
    undefined,
    notificationResponse,
  );
  const { result } = await renderHookWithInjectedClient();
  await waitFor(() => {
    expect(scope.isDone()).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
  expect(result.current.data).toEqual(notificationResponse);
});

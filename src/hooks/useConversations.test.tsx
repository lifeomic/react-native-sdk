import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';
import { useHasUnread } from './useConversations';
import { useProfilesForTile } from './useMessagingProfiles';
import { useUser } from './useUser';
import { GraphQLClientContextProvider } from './useGraphQLClient';

const baseURL = 'http://localhost:8080/unit-test';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn().mockReturnValue({ account: 'account' }),
}));
jest.mock('./useMessagingProfiles', () => ({
  useProfilesForTile: jest.fn(),
}));
jest.mock('./useUser', () => ({
  useUser: jest.fn(),
}));

const useProfilesForTileMock = useProfilesForTile as jest.Mock;
const useUserMock = useUser as jest.Mock;

const renderHookInContext = <T extends any>(useHook: () => T) => {
  return renderHook(() => useHook(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useProfilesForTileMock.mockReturnValue({
    data: [{ id: 'profile1' }],
  });
  useUserMock.mockReturnValue({ data: { id: 'userId' } });
});

describe('useHasUnread', () => {
  test('returns true if there are matching conversations', async () => {
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      {},
      {
        conversations: {
          edges: [
            {
              node: {
                conversationId: 'conversation1',
                userIds: ['userId', 'profile1'],
                hasUnread: true,
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    );

    const { result } = renderHookInContext(() => useHasUnread(''));

    await waitFor(() => scope.done());

    expect(result.current).toBe(true);
  });

  test('returns false if there are conversations with no matching profiles', async () => {
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      {},
      {
        conversations: {
          edges: [
            {
              node: {
                conversationId: 'conversation2',
                userIds: ['userId', 'profile2'],
                hasUnread: true,
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    );

    const { result } = renderHookInContext(() => useHasUnread(''));

    await waitFor(() => scope.done());

    expect(result.current).toBe(false);
  });

  test('handles missing user and profile data', async () => {
    // Simulate data not loaded
    useProfilesForTileMock.mockReturnValue({ data: undefined });
    useUserMock.mockReturnValue({ data: undefined });

    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      {},
      {
        conversations: {
          edges: [
            {
              node: {
                conversationId: 'conversation2',
                userIds: ['userId', 'profile1'],
                hasUnread: true,
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    );

    const { result } = renderHookInContext(() => useHasUnread(''));

    await waitFor(() => scope.done());

    expect(result.current).toBe(false);
  });
});

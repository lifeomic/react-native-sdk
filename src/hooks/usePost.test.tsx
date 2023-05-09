import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { PostDetailsPostQueryResponse, usePost } from './usePosts';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from './useGraphQLClient';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const renderHookWithInjectedClient = async (
  postId: string,
  disabled = false,
) => {
  return renderHook(() => usePost(postId, disabled), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
  });
};

const useActiveAccountMock = useActiveAccount as jest.Mock;

describe('usePost', () => {
  beforeEach(() => {
    useActiveAccountMock.mockReturnValue({
      accountHeaders: {
        'LifeOmic-Account': 'unittest',
      },
    });
  });

  test('does not fetch the result if disabled', async () => {
    const { result } = await renderHookWithInjectedClient('post', true); // disabled

    expect(result.current).toEqual(
      expect.objectContaining({
        isIdle: true,
        isLoading: false,
      }),
    );
  });

  test('does not fetch the result if there are no account headers', async () => {
    useActiveAccountMock.mockReturnValue({
      isFetched: true,
      accountHeaders: undefined,
    });

    const { result } = await renderHookWithInjectedClient('post');

    expect(result.current).toEqual(
      expect.objectContaining({
        isIdle: true,
        isLoading: false,
      }),
    );
  });

  test('returns query result', async () => {
    const response: PostDetailsPostQueryResponse = {
      post: {
        id: 'post',
        parentId: '',
        replyCount: 1,
        createdAt: '2021-11-22T18:42:36.000Z',
        author: {
          profile: {
            displayName: 'Shaggy',
            picture: '',
          },
        },
        __typename: 'ActivePost',
        message: 'Zoinks!',
        priority: 'high',
        metadata: {},
        status: 'status',
        attachments: [],
        reactionTotals: [],
        replies: {
          pageInfo: {},
          edges: [],
        },
      },
    };
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      undefined,
      response,
    );
    const { result } = await renderHookWithInjectedClient('post');
    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toEqual(response);
  });
});

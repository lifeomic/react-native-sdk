import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { PostRepliesQueryResponse, useLoadReplies, Post } from './usePosts';
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
const renderHookWithInjectedClient = () => {
  return renderHook(() => useLoadReplies(), {
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

describe('useLoadReplies', () => {
  beforeEach(() => {
    useActiveAccountMock.mockReturnValue({
      accountHeaders: {
        'LifeOmic-Account': 'unittest',
      },
    });
  });

  test('does not fetch the result if there are no account headers', () => {
    useActiveAccountMock.mockReturnValue({
      isFetched: true,
      accountHeaders: undefined,
    });

    const { result } = renderHookWithInjectedClient();

    act(() => {
      result.current.loadReplies({
        id: 'id',
        replies: {
          pageInfo: {
            endCursor: 'next',
          },
        },
      } as Post);
    });

    expect(result.current.isFetched).toEqual(false);
  });

  test('returns query result', async () => {
    const response: PostRepliesQueryResponse = {
      post: {
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
    const { result } = renderHookWithInjectedClient();

    act(() => {
      result.current.loadReplies({
        id: 'id',
        replies: {
          pageInfo: {
            endCursor: 'next',
          },
        },
      } as Post);
    });

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetched).toBe(true);
    });

    expect(result.current.data).toEqual(response);
  });

  test('should update query state when new data is fetched', async () => {
    const response: PostRepliesQueryResponse = {
      post: {
        replies: {
          pageInfo: {
            hasNextPage: false,
          },
          edges: [
            {
              node: {
                id: 'newPost',
                message: 'post data',
              } as Post,
            },
          ],
        },
      },
    };
    const initialPost = {
      id: 'id',
      replyCount: 1,
      replies: {
        edges: [] as any,
        pageInfo: {
          endCursor: 'next',
          hasNextPage: true,
        },
      },
    } as Post;
    queryClient.setQueryData<PostRepliesQueryResponse>(
      ['postDetails', initialPost.id],
      {
        post: initialPost,
      },
    );
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      undefined,
      response,
    );
    const { result } = renderHookWithInjectedClient();

    act(() => {
      result.current.loadReplies(initialPost);
    });

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(result.current.isFetched).toBe(true);
    });

    expect(result.current.data).toEqual(response);
    await waitFor(() => {
      expect(queryClient.getQueryData(['postDetails', initialPost.id])).toEqual(
        {
          post: {
            ...initialPost,
            ...response.post,
          },
        },
      );
    });
  });
});

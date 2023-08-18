import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from '../useActiveAccount';
import { PostDetailsPostQueryResponse } from './useInfinitePosts';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../useGraphQLClient';
import { mockGraphQLResponse } from '../../common/testHelpers/mockGraphQLResponse';
import { Post } from './types';
import { usePost } from './usePost';

jest.mock('../useActiveAccount', () => ({
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
const renderHookWithInjectedClient = async (post: string | Post) => {
  return renderHook(
    () => usePost(typeof post === 'string' ? { id: post } : post),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <GraphQLClientContextProvider baseURL={baseURL}>
            {children}
          </GraphQLClientContextProvider>
        </QueryClientProvider>
      ),
    },
  );
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

  test('does not fetch the result if there are no account headers', async () => {
    useActiveAccountMock.mockReturnValue({
      isFetched: true,
      accountHeaders: undefined,
    });

    const { result } = await renderHookWithInjectedClient('post');

    expect(result.current).toEqual(
      expect.objectContaining({
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

  test('returns placeholder data until result is fetched', async () => {
    const placeholderPost: Post = {
      id: 'post2',
      parentId: '',
      replyCount: 1,
      createdAt: '2021-11-22T18:42:36.000Z',
      author: {
        profile: {
          displayName: 'Not Shaggy',
          picture: '',
        },
      },
      __typename: 'ActivePost',
      message: 'Temp data',
      status: 'status',
      reactionTotals: [],
      replies: {
        pageInfo: {},
        edges: [],
      },
    };
    const response: PostDetailsPostQueryResponse = {
      post: {
        id: 'post2',
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
    const { result } = await renderHookWithInjectedClient(placeholderPost);

    expect(result.current.isPlaceholderData).toEqual(true);
    expect(result.current.data?.post).toEqual(placeholderPost);

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(result.current.isPlaceholderData).toBe(false);
    });

    expect(result.current.data).toEqual(response);
  });
});

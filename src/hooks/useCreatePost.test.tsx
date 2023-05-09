import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { ParentType, Post, useCreatePost } from './usePosts';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from './useGraphQLClient';
import nock from 'nock';

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
const renderHookWithInjectedClient = async () => {
  return renderHook(() => useCreatePost(), {
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

const getDataWithPosts = (postEdges: any) => ({
  pages: [
    {
      postsV2: {
        pageInfo: { endCursor: '10', hasNextPage: true },
        edges: postEdges,
      },
    },
  ],
  pageParams: [],
});

describe('useCreatePost', () => {
  beforeEach(() => {
    useActiveAccountMock.mockReturnValue({
      accountHeaders: {
        'LifeOmic-Account': 'unittest',
      },
    });
  });

  test('useCreatePost mutation', async () => {
    const RealDate = Date;
    const mockTime = 1620586800000;
    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate(mockTime);
      }
      getTime() {
        return mockTime;
      }
    } as any;

    queryClient.setQueryData('posts', getDataWithPosts([]));
    const scope = nock(`${baseURL}/v1/graphql`)
      .post('')
      .times(1)
      .reply(200, function (_, requestBody) {
        const body = JSON.parse(JSON.stringify(requestBody));
        const { postId, type } = body.variables.input;
        return { data: { postId, type, userId: 'someUser' } };
      });

    const onSuccessMock = jest.fn();
    const { result } = await renderHookWithInjectedClient();
    const expectedPost: Post = {
      __typename: 'ActivePost',
      parentId: '456',
      replyCount: 0,
      createdAt: `${new Date().getTime()}`,
      status: 'READY',
      reactionTotals: [],
      replies: { edges: [], pageInfo: {} },
      id: '123',
      message: 'somePost',
      author: {
        profile: {
          displayName: '',
          picture: '',
        },
      },
    };

    const createPostInput = {
      message: 'somePost',
      id: '123',
      parentId: '456',
      parentType: ParentType.CIRCLE,
    };

    result.current.mutate(
      { post: createPostInput },
      { onSuccess: onSuccessMock },
    );

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(onSuccessMock).toBeCalled();
    });

    expect(queryClient.getQueryData('posts')).toEqual(
      getDataWithPosts([{ node: expectedPost }]),
    );
    global.Date = RealDate;
  });
});

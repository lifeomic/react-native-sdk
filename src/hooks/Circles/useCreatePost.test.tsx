import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../useGraphQLClient';
import nock from 'nock';
import { Post, ParentType } from './types';
import { useCreatePost } from './useCreatePost';
import { ActiveAccountProvider } from '../useActiveAccount';

jest.mock('./useActiveCircleTile', () => ({
  useActiveCircleTile: jest.fn().mockImplementation(() => ({
    circleTile: {
      circleId: 'someCircleId',
    },
  })),
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
        <ActiveAccountProvider account="mockaccount">
          <GraphQLClientContextProvider baseURL={baseURL}>
            {children}
          </GraphQLClientContextProvider>
        </ActiveAccountProvider>
      </QueryClientProvider>
    ),
  });
};

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
  test('useCreatePost mutation', async () => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor() {
        super();
      }
      toISOString(): string {
        return '2023-05-09T02:00:00';
      }
    } as any;

    queryClient.setQueryData(['posts', 'someCircleId'], getDataWithPosts([]));
    const scope = nock(`${baseURL}/v1/graphql`)
      .post('')
      .times(2)
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
      createdAt: new Date().toISOString(),
      status: 'READY',
      reactionTotals: [],
      attachmentsV2: { edges: [] },
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

    onSuccessMock.mockReset();

    result.current.mutate(
      { post: createPostInput },
      { onSuccess: onSuccessMock },
    );

    await waitFor(() => {
      expect(onSuccessMock).toBeCalled();
    });

    expect(queryClient.getQueryData(['posts', 'someCircleId'])).toEqual(
      getDataWithPosts([{ node: expectedPost }]),
    );

    const createSubPostInput = {
      message: 'someCommentPost',
      id: '789',
      parentId: createPostInput.id,
      parentType: ParentType.POST,
    };

    result.current.mutate(
      { post: createSubPostInput },
      { onSuccess: onSuccessMock },
    );

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(onSuccessMock).toBeCalled();
    });

    const expectedCommentPost: Post = {
      __typename: 'ActivePost',
      parentId: '123',
      replyCount: 0,
      createdAt: new Date().toISOString(),
      status: 'READY',
      reactionTotals: [],
      attachmentsV2: { edges: [] },
      replies: { edges: [], pageInfo: {} },
      id: '789',
      message: 'someCommentPost',
      author: {
        profile: {
          displayName: '',
          picture: '',
        },
      },
    };

    expectedPost.replyCount = 1;
    expectedPost.replies.edges.push({
      node: expectedCommentPost,
    });
    expect(queryClient.getQueryData(['posts', 'someCircleId'])).toEqual(
      getDataWithPosts([{ node: expectedPost }]),
    );
    global.Date = RealDate;
  });
});

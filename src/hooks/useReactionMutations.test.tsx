import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from './useGraphQLClient';
import nock from 'nock';
import {
  useCreateReactionMutation,
  useUndoReactionMutation,
} from './useReactionMutations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';

const renderCreateReactionHook = async () => {
  return renderHook(() => useCreateReactionMutation(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
  });
};

const renderUndoReactionHook = async () => {
  return renderHook(() => useUndoReactionMutation(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
  });
};

const getDataWithCount = ({
  count,
  userHasReacted,
}: {
  count: number;
  userHasReacted: boolean;
}) => ({
  pages: [
    {
      postsV2: {
        pageInfo: { endCursor: '10', hasNextPage: true },
        edges: [
          {
            node: {
              __typename: 'ActivePost',
              createdAt: '0',
              status: 'READY',
              parentId: '123',
              replyCount: 0,
              replies: { edges: [], pageInfo: {} },
              id: 'somePostId',
              reactionTotals: [{ type: '(-_-)', count: count, userHasReacted }],
            },
          },
        ],
      },
    },
  ],
  pageParams: [],
});

test('useCreateReaction mutation', async () => {
  queryClient.setQueryData(
    'posts',
    getDataWithCount({ count: 0, userHasReacted: false }),
  );

  const scope = nock(`${baseURL}/v1/graphql`)
    .post('')
    .times(1)
    .reply(200, function (_, requestBody) {
      const body = JSON.parse(JSON.stringify(requestBody));
      const { postId, type } = body.variables.input;
      return { data: { postId, type, userId: 'someUser' } };
    });

  const onSuccessMock = jest.fn();
  const { result } = await renderCreateReactionHook();
  result.current.mutate(
    { postId: 'somePostId', type: '(-_-)' },
    { onSuccess: onSuccessMock },
  );

  await waitFor(() => {
    expect(scope.isDone()).toBe(true);
    expect(onSuccessMock).toBeCalled();
  });

  expect(queryClient.getQueryData('posts')).toEqual(
    getDataWithCount({ count: 1, userHasReacted: true }),
  );
});

test('useUndoReaction mutation', async () => {
  queryClient.setQueryData(
    'posts',
    getDataWithCount({ count: 1, userHasReacted: true }),
  );

  const scope = nock(`${baseURL}/v1/graphql`)
    .post('')
    .times(1)
    .reply(200, function (_, requestBody) {
      const body = JSON.parse(JSON.stringify(requestBody));
      const { postId, type } = body.variables.input;
      return { data: { postId, type, userId: 'someUser' } };
    });

  const onSuccessMock = jest.fn();
  const { result } = await renderUndoReactionHook();
  result.current.mutate(
    { postId: 'somePostId', type: '(-_-)', userId: 'someUser' },
    { onSuccess: onSuccessMock },
  );

  await waitFor(() => {
    expect(scope.isDone()).toBe(true);
    expect(onSuccessMock).toBeCalled();
  });

  expect(queryClient.getQueryData('posts')).toEqual(
    getDataWithCount({ count: 0, userHasReacted: false }),
  );
});

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

test('useCreateReaction mutation', async () => {
  const scope = nock(`${baseURL}/v1/graphql`)
    .post('')
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
    expect(onSuccessMock).toBeCalledWith(
      {
        postId: 'somePostId',
        type: '(-_-)',
        userId: 'someUser',
      },
      {
        postId: 'somePostId',
        type: '(-_-)',
      },
      undefined,
    );
  });
});

test('useUndoReaction mutation', async () => {
  const scope = nock(`${baseURL}/v1/graphql`)
    .post('')
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
    expect(onSuccessMock).toBeCalledWith(
      {
        postId: 'somePostId',
        type: '(-_-)',
        userId: 'someUser',
      },
      {
        postId: 'somePostId',
        type: '(-_-)',
        userId: 'someUser',
      },
      undefined,
    );
  });
});

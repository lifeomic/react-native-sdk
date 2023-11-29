import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GraphQLClientContextProvider } from '../useGraphQLClient';
import { InfinitePostsData, useInfinitePosts } from './useInfinitePosts';
import nock from 'nock';
import { ActiveAccountProvider } from '../useActiveAccount';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const renderHookWithInjectedClient = async () => {
  return renderHook(() => useInfinitePosts({ circleId: 'circle' }), {
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

test('useInfinitePosts query can page', async () => {
  const data = {
    postsV2: {
      pageInfo: { endCursor: '10', hasNextPage: true },
      edges: [],
    },
  };

  const data2 = {
    postsV2: {
      pageInfo: { endCursor: '20', hasNextPage: false },
      edges: [],
    },
  };

  const scope = nock(`${baseURL}/v1/graphql`)
    .post('')
    .times(1)
    .reply(200, function () {
      return { data: data };
    })
    .post('')
    .times(1)
    .reply(200, function () {
      return { data: data2 };
    });

  const expectedPostsResponse: InfinitePostsData = {
    pageParams: [],
    pages: [
      {
        ...data,
      },
    ],
  };

  const expectedPostsResponse2: InfinitePostsData = {
    pageParams: [undefined, '10'],
    pages: [
      {
        ...data,
      },
      {
        ...data2,
      },
    ],
  };

  const { result } = await renderHookWithInjectedClient();
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toEqual(expectedPostsResponse);

  result.current.fetchNextPage();
  await waitFor(() => {
    expect(scope.isDone()).toBe(true);
    expect(result.current.isFetchingNextPage).toBe(false);
  });
  expect(result.current.data).toEqual(expectedPostsResponse2);
});

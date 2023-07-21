import { gql } from 'graphql-request';
import { useState, useCallback } from 'react';
import { useQueryClient, useQuery } from 'react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useGraphQLClient } from '../useGraphQLClient';
import { Post, postDetailsFragment } from './types';
import { PostRepliesQueryResponse } from './useInfinitePosts';
import { optimisticallyUpdatePosts } from './utils/optimisticallyUpdatePosts';

export const useLoadReplies = () => {
  const { graphQLClient } = useGraphQLClient();
  const queryClient = useQueryClient();
  const { isFetched, accountHeaders } = useActiveAccount();
  const [queryVariables, setQueryVariables] = useState({
    after: undefined as string | undefined,
    id: '',
    circleId: undefined as string | undefined,
  });

  const queryForPostReplies = useCallback(async () => {
    if (!queryVariables?.id) {
      return;
    }
    return graphQLClient.request<
      PostRepliesQueryResponse,
      { id: string; after?: string }
    >(postRepliesQueryDocument, queryVariables, accountHeaders);
  }, [accountHeaders, graphQLClient, queryVariables]);

  const repliesRes = useQuery(
    [
      `loadReplies-${queryVariables.circleId}`,
      queryVariables.id,
      queryVariables.after,
    ],
    queryForPostReplies,
    {
      enabled: isFetched && !!accountHeaders && !!queryVariables.id,
      onSuccess(data) {
        if (!data) {
          return;
        }

        optimisticallyUpdatePosts({
          queryClient,
          id: queryVariables.id,
          circleId: queryVariables.circleId,
          transformFn: (post) => {
            post.replies = post.replies ?? { edges: [] };
            post.replies.edges.push(...data.post.replies.edges);
            post.replies.pageInfo = data.post.replies.pageInfo;

            return post;
          },
        });
      },
    },
  );

  const loadReplies = (post: Post) => {
    setQueryVariables({
      id: post.id,
      after: post.replies?.pageInfo?.endCursor,
      circleId: post.circle?.id,
    });
  };

  return {
    ...repliesRes,
    queryVariables,
    loadReplies,
  };
};

const postRepliesQueryDocument = gql`
  ${postDetailsFragment}

  query PostReplies($id: ID!, $after: String) {
    post(id: $id) {
      replies(order: NEWEST, first: 10, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            ...PostDetails
          }
        }
      }
    }
  }
`;

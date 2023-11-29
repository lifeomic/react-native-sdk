import { gql } from 'graphql-request';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useGraphQLClient } from '../useGraphQLClient';
import { Post, postDetailsFragment } from './types';
import { PostDetailsPostQueryResponse } from './useInfinitePosts';

export const usePost = (post: Partial<Post> & Pick<Post, 'id'>) => {
  const { graphQLClient } = useGraphQLClient();

  const queryForPostDetails = useCallback(async () => {
    return graphQLClient.request<PostDetailsPostQueryResponse, { id: string }>(
      postDetailsQueryDocument,
      {
        id: post.id,
      },
    );
  }, [graphQLClient, post.id]);

  return useQuery(['postDetails', post.id], queryForPostDetails, {
    placeholderData: {
      post,
    },
  });
};

const postDetailsQueryDocument = gql`
  ${postDetailsFragment}

  query PostDetailsPost($id: ID!) {
    post(id: $id) {
      ...PostDetails
      replies(order: NEWEST, first: 10) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            id
            ...PostDetails
            replies(order: NEWEST, first: 2) {
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
      }
    }
  }
`;

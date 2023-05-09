import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';

export const usePost = (postId: string, disabled?: boolean) => {
  const { graphQLClient } = useGraphQLClient();
  const { isFetched, accountHeaders } = useActiveAccount();

  const queryForPostDetails = useCallback(async () => {
    return graphQLClient.request<PostDetailsPostQueryResponse, { id: string }>(
      postDetailsQuery,
      {
        id: postId,
      },
      accountHeaders,
    );
  }, [accountHeaders, graphQLClient, postId]);

  return useQuery('postDetails', queryForPostDetails, {
    enabled: !disabled && isFetched && !!accountHeaders,
  });
};

export type Post = {
  __typename: string;
  author: {
    profile: {
      displayName: string;
    };
  };
  id: string;
  parentId: string;
  priority: string;
  replyCount: number;
  createdAt: string;
  deletedAt?: string;
  status: string;
  message: string;
  attachments: {}[];
  reactionTotals: {
    type: string;
    url: string;
    count: number;
    userHasReacted: boolean;
  }[];
  metadata: unknown;
  replies: {
    edges: {
      node: Post;
    }[];
    pageInfo: {
      endCursor?: string;
      hasNextPage?: boolean;
    };
  };
};

export type PostDetailsPostQueryResponse = {
  post: Post;
};

const postDetailsQuery = gql`
  fragment PostDetails on Post {
    id
    createdAt
    ... on DeletedPost {
      deletedAt
    }
    ... on ActivePost {
      message
      author {
        profile {
          displayName
        }
      }
      reactionTotals {
        type
        url
        count
        userHasReacted
      }
    }
  }
  query PostDetailsPost($id: ID!, $after: String) {
    post(id: $id) {
      ...PostDetails
      replies(order: NEWEST, first: 10, after: $after) {
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

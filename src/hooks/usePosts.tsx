import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';
import { useCallback } from 'react';
import uuid from 'react-native-uuid';
import { useUser } from './useUser';

export enum ParentType {
  CIRCLE = 'CIRCLE',
  POST = 'POST',
}
export type InfinitePostsData = InfiniteData<PostsData>;
export type PostsData = {
  postsV2: {
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
    edges: {
      node: Post;
    }[];
  };
};

export type Post = {
  __typename: string;
  author?: {
    profile: {
      displayName: string;
      picture: string;
    };
  };
  id: string;
  parentId: string;
  priority?: string;
  replyCount: number;
  createdAt: string;
  deletedAt?: string;
  status: string;
  message?: string;
  attachments?: {}[];
  reactionTotals: {
    type: string;
    url?: string;
    count: number;
    userHasReacted?: boolean;
  }[];
  metadata?: unknown;
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

type useInfinitePostsProps = {
  circleId?: string;
};

export function useInfinitePosts({ circleId }: useInfinitePostsProps) {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

  const queryPosts = async ({ pageParam }: { pageParam?: string }) => {
    const variables = {
      filter: {
        parentType: ParentType.CIRCLE,
        parentId: circleId,
      },
      after: pageParam,
    };

    return graphQLClient.request<PostsData>(
      postsV2QueryDocument,
      variables,
      accountHeaders,
    );
  };

  const {
    isLoading: postsLoading,
    isFetched: postsFetched,
    isFetchingNextPage,
    data: postsData,
    error: postsError,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery('posts', queryPosts, {
    enabled: !!accountHeaders?.['LifeOmic-Account'] && !!circleId,
    getNextPageParam: (lastPage) => {
      return lastPage.postsV2.pageInfo.hasNextPage
        ? lastPage.postsV2.pageInfo.endCursor
        : undefined;
    },
  });

  return {
    isLoading: postsLoading,
    isFetched: postsFetched,
    isFetchingNextPage,
    error: postsError,
    data: postsData,
    hasNextPage,
    fetchNextPage,
  };
}

export const usePost = (postId: string, disabled?: boolean) => {
  const { graphQLClient } = useGraphQLClient();
  const { isFetched, accountHeaders } = useActiveAccount();

  const queryForPostDetails = useCallback(async () => {
    return graphQLClient.request<PostDetailsPostQueryResponse, { id: string }>(
      postDetailsQueryDocument,
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

const postsV2QueryDocument = gql`
  query PostsV2($filter: PostFilter!, $after: String) {
    postsV2(filter: $filter, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          id
          ... on ActivePost {
            author {
              profile {
                displayName
                picture
              }
            }
            createdAt
            message
            replyCount
            reactionTotals {
              count
              type
              userHasReacted
            }
          }
        }
      }
    }
  }
`;

const postDetailsQueryDocument = gql`
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


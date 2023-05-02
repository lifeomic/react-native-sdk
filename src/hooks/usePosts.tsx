import { useInfiniteQuery } from 'react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';

export function usePosts({ circleId }: { circleId?: string }) {
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

    return graphQLClient.request<PostsQueryResponse>(
      postsV2Query,
      variables,
      accountHeaders,
    );
  };

  const {
    isLoading: postsLoading,
    isFetched: postsFetched,
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
    error: postsError,
    data: postsData,
    hasNextPage,
    fetchNextPage,
  };
}

type PostsQueryResponse = {
  postsV2: {
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
    edges: {
      node: UserPost;
    }[];
  };
};

export type UserPost = {
  id: string;
  author: {
    profile: {
      displayName: string;
      picture: string;
    };
  };
  createdAt: string;
  message: string;
  replyCount: number;
  reactionTotals: {
    type: string;
    count: number;
  }[];
};

enum ParentType {
  CIRCLE = 'CIRCLE',
}

const postsV2Query = gql`
  query PostsV2($filter: PostFilter!, $after: String) {
    postsV2(filter: $filter, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
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
            }
          }
        }
      }
    }
  }
`;

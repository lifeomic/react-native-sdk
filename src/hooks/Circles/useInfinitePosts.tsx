import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from '../useGraphQLClient';
import { useActiveAccount } from '../useActiveAccount';
import { ParentType, Post, postDetailsFragment } from './types';
import { useActiveCircleTile } from './useActiveCircleTile';

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

export type PostDetailsPostQueryResponse = {
  post: Post;
};

export type PostRepliesQueryResponse = {
  post: Pick<Post, 'replies'>;
};

type useInfinitePostsProps = {
  circleId?: string;
};

export function useInfinitePosts({ circleId }: useInfinitePostsProps) {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const { circleTile } = useActiveCircleTile();

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
  } = useInfiniteQuery(['posts', circleTile?.circleId], queryPosts, {
    enabled: !!circleId,
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

const postsV2QueryDocument = gql`
  ${postDetailsFragment}

  query PostsV2($filter: PostFilter!, $after: String) {
    postsV2(filter: $filter, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
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
`;

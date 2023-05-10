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
import { useUser } from './useUser';
import omit from 'lodash/omit';

export enum ParentType {
  CIRCLE = 'CIRCLE',
  POST = 'POST',
}

export enum Priority {
  STANDARD = 'STANDARD',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum AttachmentType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  EVENT = 'EVENT',
  PDF = 'PDF',
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

type CreatePostInput = {
  post: {
    id: string;
    message: string;
    parentId: string;
    parentType: ParentType;
    priority?: Priority;
    attachmentsV2?: {
      externalId: string;
      type: AttachmentType;
      subType: string;
    }[];
  };
};

export function useCreatePost() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const { data } = useUser();
  const queryClient = useQueryClient();

  const createPostMutation = async (input: CreatePostInput) => {
    const variables = {
      input,
    };

    return graphQLClient.request(
      createPostMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation('createPost', createPostMutation, {
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update to the new value
      queryClient.setQueryData(['posts'], (currentData?: InfinitePostsData) => {
        const newData: InfinitePostsData = currentData ?? {
          pages: [
            {
              postsV2: {
                edges: [],
                pageInfo: { endCursor: '', hasNextPage: false },
              },
            },
          ],
          pageParams: [],
        };

        const optimisticPost: Post = {
          ...omit(newPost.post, 'parentType'),
          __typename: 'ActivePost',
          reactionTotals: [],
          createdAt: new Date().toISOString(),
          replyCount: 0,
          status: 'READY',
          replies: { edges: [], pageInfo: {} },
          author: {
            profile: {
              displayName: data?.profile.displayName ?? '',
              picture: data?.profile.picture ?? '',
            },
          },
        };

        newData.pages[0].postsV2.edges.unshift({ node: optimisticPost });
        return newData;
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
  });
}

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

const createPostMutationDocument = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        id
      }
    }
  }
`;

import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from '../useGraphQLClient';
import { useActiveAccount } from '../useActiveAccount';
import { Post, postDetailsFragment } from './types';
import { useUser } from '../useUser';
import { IMessage } from 'react-native-gifted-chat';
import uuid from 'react-native-uuid';

/**
 * privatePosts
 */
export type InfinitePrivatePostsData = InfiniteData<PrivatePostsData>;
export type PrivatePostsData = {
  privatePosts: {
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

export const postToMessage = (post: Partial<Post>): IMessage => ({
  _id: post.id ?? uuid.v4().toString(),
  text: post.message || '',
  createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
  user: {
    _id: post.authorId ?? uuid.v4().toString(),
    name: post.author?.profile.displayName,
    avatar: post.author?.profile.picture,
  },
});

export function useInfinitePrivatePosts(userId: string) {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const { data } = useUser();

  const queryPosts = async ({ pageParam }: { pageParam?: string }) => {
    const variables = {
      userIds: [data?.id, userId],
      filter: {
        order: 'NEWEST',
      },
      after: pageParam,
    };

    return graphQLClient.request<PrivatePostsData>(
      privatePostsQueryDocument,
      variables,
      accountHeaders,
    );
  };

  return useInfiniteQuery(['privatePosts', data?.id, userId], queryPosts, {
    enabled: !!accountHeaders?.['LifeOmic-Account'] && !!data?.id,
    getNextPageParam: (lastPage) => {
      return lastPage.privatePosts.pageInfo.hasNextPage
        ? lastPage.privatePosts.pageInfo.endCursor
        : undefined;
    },
    refetchInterval: 5000,
    // Continuously polls while query component is focused
    // Switch to Websocket/Subscription model would be an improvement
  });
}

const privatePostsQueryDocument = gql`
  ${postDetailsFragment}

  query PrivatePosts(
    $userIds: [ID!]!
    $filter: PrivatePostFilter!
    $after: String
  ) {
    privatePosts(userIds: $userIds, filter: $filter, after: $after) {
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

/**
 * CreatePrivatePost
 */
interface CreatePrivatePostMutationProps {
  userIds: {
    currentUserId: string;
    recipientUserId: string;
  };
  post: {
    message: string;
  };
}

export function useCreatePrivatePostMutation() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();
  const { data: userData } = useUser();

  const createPrivatePostMutation = async ({
    userIds,
    post,
  }: CreatePrivatePostMutationProps) => {
    const variables = {
      input: {
        userIds: [userIds.currentUserId, userIds.recipientUserId],
        post,
      },
    };

    return graphQLClient.request(
      createPrivatePostMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation(['createPrivatePost'], {
    mutationFn: createPrivatePostMutation,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [
          'privatePosts',
          variables.userIds.currentUserId,
          variables.userIds.recipientUserId,
        ],
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData([
        ['privatePosts', variables.userIds.currentUserId],
      ]);

      queryClient.setQueryData(
        [
          'privatePosts',
          variables.userIds.currentUserId,
          variables.userIds.recipientUserId,
        ],
        (currentCache: InfinitePrivatePostsData | undefined) => {
          const post: Partial<Post> = {
            id: uuid.v4().toString(),
            message: variables.post.message,
            createdAt: new Date().toISOString(),
            authorId: userData?.id,
            author: {
              profile: {
                displayName: userData?.profile.displayName!,
                picture: userData?.profile.picture!,
              },
            },
          };

          const result = { ...currentCache } as InfinitePrivatePostsData;

          // Since this is a new post always append to the first page as the first node
          result.pages[0].privatePosts.edges.unshift({ node: post as Post });
          return result;
        },
      );

      return { previousPosts };
    },
  });
}

const createPrivatePostMutationDocument = gql`
  mutation CreatePrivatePost($input: CreatePrivatePostInput!) {
    createPrivatePost(input: $input) {
      post {
        id
        message
        createdAt
        author {
          userId
          profile {
            displayName
            picture
          }
        }
      }
    }
  }
`;

import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import cloneDeep from 'lodash/cloneDeep';
import { useProfilesForTile } from './useMessagingProfiles';
import { useUser } from './useUser';

const conversationsQueryDocument = gql`
  query Conversations($after: String, $first: Int) {
    conversations(after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          conversationId
          userIds
          latestMessageText
          latestMessageTime
          latestMessageUserId
          hasUnread
        }
      }
    }
  }
`;

const leaveConversationMutationDocument = gql`
  mutation ($input: LeaveConversationInput!) {
    leaveConversation(input: $input)
  }
`;

const markAsReadMutationDocument = gql`
  mutation ($input: MarkAsReadInput!) {
    markAsRead(input: $input)
  }
`;

export type InfiniteConversationsData = InfiniteData<ConversationsData>;

type Conversation = {
  conversationId: string;
  userIds: string[];
  latestMessageText: string;
  latestMessageTime: string;
  latestMessageUserId: string;
  hasUnread: boolean;
};

type MarkAsReadInput = {
  conversationId: string;
};

type LeaveConversationInput = {
  conversationId: string;
};

export type ConversationsData = PageInfoData & {
  conversations: {
    edges: {
      node: Conversation;
    }[];
  };
};

export type PageInfoData = {
  conversations: {
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
  };
};

export function useHasUnread(tileId: string) {
  const { data: userData } = useUser();
  const { data } = useInfiniteConversations();
  const { data: profiles } = useProfilesForTile(tileId);

  return (
    data?.pages
      ?.flatMap((page) =>
        page.conversations.edges
          .flatMap((edge) => edge.node)
          // Conversations that contain users not part of this message tile should be hidden
          .filter((node) =>
            node.userIds.every(
              (id) => id === userData?.id || profiles?.find((p) => p.id === id),
            ),
          ),
      )
      ?.some((node) => node.hasUnread === true) ?? false
  );
}

export function useInfiniteConversations() {
  const { graphQLClient } = useGraphQLClient();

  const queryConversations = async ({ pageParam }: { pageParam?: string }) => {
    const variables = {
      after: pageParam,
    };

    return graphQLClient.request<ConversationsData>(
      conversationsQueryDocument,
      variables,
    );
  };

  return useInfiniteQuery(['conversations'], queryConversations, {
    getNextPageParam: (lastPage) => {
      return lastPage.conversations.pageInfo.hasNextPage
        ? lastPage.conversations.pageInfo.endCursor
        : undefined;
    },
  });
}

export function useMarkAsRead() {
  const { graphQLClient } = useGraphQLClient();

  const markAsReadMutation = async (input: MarkAsReadInput) => {
    const variables = {
      input,
    };

    return graphQLClient.request(markAsReadMutationDocument, variables);
  };

  return useMutation({ mutationFn: markAsReadMutation });
}

export function useLeaveConversation() {
  const { graphQLClient } = useGraphQLClient();
  const queryClient = useQueryClient();

  const leaveConversationMutation = async (input: LeaveConversationInput) => {
    const variables = {
      input,
    };

    return graphQLClient.request(leaveConversationMutationDocument, variables);
  };

  return useMutation({
    mutationFn: leaveConversationMutation,
    onMutate: async ({ conversationId }) => {
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      const previousPosts = queryClient.getQueryData(['conversations']);

      queryClient.setQueryData<InfiniteConversationsData>(
        ['conversations'],
        (currentData) => {
          if (!currentData) {
            return currentData!;
          }
          const newData = cloneDeep(currentData);
          for (const page of newData?.pages) {
            const edges = page.conversations.edges.filter(
              ({ node }) => node.conversationId !== conversationId,
            );
            page.conversations.edges = edges;
          }

          return newData!;
        },
      );

      return { previousPosts };
    },
  });
}

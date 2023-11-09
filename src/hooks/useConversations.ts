import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';
import cloneDeep from 'lodash/cloneDeep';

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

export function useHasUnread() {
  const { data } = useInfiniteConversations();
  return data?.pages
    .flat()
    .flatMap((pageData) => pageData.conversations.edges)
    .some(({ node }) => node.hasUnread === true);
}

export function useInfiniteConversations() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

  const queryConversations = async ({ pageParam }: { pageParam?: string }) => {
    const variables = {
      after: pageParam,
    };

    return graphQLClient.request<ConversationsData>(
      conversationsQueryDocument,
      variables,
      accountHeaders,
    );
  };

  return useInfiniteQuery(['conversations'], queryConversations, {
    enabled: !!accountHeaders?.['LifeOmic-Account'],
    getNextPageParam: (lastPage) => {
      return lastPage.conversations.pageInfo.hasNextPage
        ? lastPage.conversations.pageInfo.endCursor
        : undefined;
    },
  });
}

export function useMarkAsRead() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

  const markAsReadMutation = async (input: MarkAsReadInput) => {
    const variables = {
      input,
    };

    return graphQLClient.request(
      markAsReadMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation({ mutationFn: markAsReadMutation });
}

export function useLeaveConversation() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();

  const leaveConversationMutation = async (input: LeaveConversationInput) => {
    const variables = {
      input,
    };

    return graphQLClient.request(
      leaveConversationMutationDocument,
      variables,
      accountHeaders,
    );
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

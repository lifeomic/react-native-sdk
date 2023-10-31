import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';

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

// TODO: Implement feature
// const LEAVE_CONVERSATION = gql`
//   mutation ($input: LeaveConversationInput!) {
//     leaveConversation(input: $input)
//   }
// `;

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

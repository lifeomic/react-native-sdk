import { useMutation, useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';
import { InfinitePostsData } from './usePosts';

interface CreateReactionMutationProps {
  type: string;
  postId: string;
}

interface UndoReactionMutationProps {
  userId: string;
  type: string;
  postId: string;
}

export function useCreateReactionMutation() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();

  const createReactionMutation = async ({
    type,
    postId,
  }: CreateReactionMutationProps) => {
    const variables = {
      input: {
        postId,
        type,
      },
    };

    return graphQLClient.request<Reaction>(
      createReactionMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation('createReaction', createReactionMutation, {
    onMutate: async (newReaction) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update to the new value
      queryClient.setQueryData(['posts'], (currentData?: InfinitePostsData) => {
        return optimisticUpdatePost(currentData!, newReaction);
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
  });
}

export function useUndoReactionMutation() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();

  const undoReactionMutation = async ({
    userId,
    type,
    postId,
  }: UndoReactionMutationProps) => {
    const variables = {
      input: {
        userId,
        postId,
        type,
      },
    };

    return graphQLClient.request<Reaction>(
      undoReactionMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation('undoReaction', undoReactionMutation, {
    onMutate: async (newReaction) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update to the new value
      queryClient.setQueryData(['posts'], (currentData?: InfinitePostsData) => {
        return optimisticUpdatePost(currentData!, newReaction, true);
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
  });
}

export type Reaction = {
  id: string;
  postId: string;
  userId: string;
  type: string;
};

const optimisticUpdatePost = (
  data: InfinitePostsData,
  newReaction: { type: string; postId: string },
  decrement: boolean = false,
) => {
  const pageIndx = data.pages.findIndex((page) =>
    page.postsV2.edges.some(({ node }) => {
      return node.id === newReaction.postId;
    }),
  );

  const edgeIndx = data.pages[pageIndx].postsV2.edges.findIndex(
    ({ node }) => node.id === newReaction.postId,
  );

  const { node } = data.pages[pageIndx].postsV2.edges[edgeIndx];

  const reactionIndx = node.reactionTotals?.findIndex((reaction) => {
    return reaction.type === newReaction.type;
  });

  if (reactionIndx > -1) {
    node.reactionTotals[reactionIndx].count += decrement ? -1 : 1;
    node.reactionTotals[reactionIndx].userHasReacted = !decrement;
  } else {
    node.reactionTotals.push({
      type: newReaction.type,
      count: decrement ? 0 : 1,
      userHasReacted: !decrement,
    });
  }

  return data!;
};

const createReactionMutationDocument = gql`
  mutation CreateReaction($input: CreateReactionInput!) {
    createReaction(input: $input) {
      reaction {
        id
        postId
        userId
        type
      }
    }
  }
`;

const undoReactionMutationDocument = gql`
  mutation UndoReaction($input: UndoReactionInput!) {
    undoReaction(input: $input) {
      reaction {
        id
        postId
        userId
        type
      }
    }
  }
`;

import { useMutation, useQueryClient } from 'react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from '../useGraphQLClient';
import { useActiveAccount } from '../useActiveAccount';
import { Post } from './types';
import { optimisticallyUpdatePosts } from './utils/optimisticallyUpdatePosts';

interface CreateReactionMutationProps {
  type: string;
  postId: string;
  parentId?: string;
}

interface UndoReactionMutationProps {
  userId: string;
  type: string;
  postId: string;
  parentId?: string;
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
      optimisticallyUpdatePosts({
        queryClient,
        id: newReaction.postId,
        transformFn: (post) => optimisticUpdatePost(post, newReaction)!,
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
      optimisticallyUpdatePosts({
        queryClient,
        id: newReaction.postId,
        transformFn: (post) => optimisticUpdatePost(post, newReaction, true)!,
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
  post: Post | undefined,
  newReaction: { type: string; postId: string },
  decrement: boolean = false,
) => {
  if (!post) {
    return post;
  }

  const reactionIndx = post.reactionTotals?.findIndex((reaction) => {
    return reaction.type === newReaction.type;
  });

  if (reactionIndx > -1) {
    post.reactionTotals[reactionIndx].count += decrement ? -1 : 1;
    post.reactionTotals[reactionIndx].userHasReacted = !decrement;
  } else {
    post.reactionTotals.push({
      type: newReaction.type,
      count: decrement ? 0 : 1,
      userHasReacted: !decrement,
    });
  }

  return post!;
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
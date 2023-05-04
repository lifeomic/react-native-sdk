import { useMutation } from 'react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';

interface createReactionMutationProps {
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

  const createReactionMutation = async ({
    type,
    postId,
  }: createReactionMutationProps) => {
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

  return useMutation('createReaction', createReactionMutation);
}

export function useUndoReactionMutation() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

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

  return useMutation('undoReaction', undoReactionMutation);
}

export type Reaction = {
  id: string;
  postId: string;
  userId: string;
  type: string;
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

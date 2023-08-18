import { gql } from 'graphql-request';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useGraphQLClient } from '../useGraphQLClient';
import { optimisticallyDeletePosts } from './utils/optimisticallyDeletePosts';
import { useActiveCircleTile } from './useActiveCircleTile';

export function useDeletePost() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();
  const { circleTile } = useActiveCircleTile();

  const deletePostMutation = async (input: { id: string }) => {
    const variables = {
      input,
    };

    return graphQLClient.request(
      deletePostMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation('deletePost', deletePostMutation, {
    onMutate: async (deletedPost) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      optimisticallyDeletePosts({
        queryClient,
        postId: deletedPost.id,
        circleId: circleTile?.circleId,
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
  });
}

const deletePostMutationDocument = gql`
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      post {
        id
      }
    }
  }
`;

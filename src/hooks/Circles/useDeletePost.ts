import { gql } from 'graphql-request';
import { useQueryClient, useMutation } from 'react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useGraphQLClient } from '../useGraphQLClient';
import { optimisticallyDeletePosts } from './utils/optimisticallyDeletePosts';
import omit from 'lodash/omit';

export function useDeletePost() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();

  const deletePostMutation = async (input: {
    id: string;
    circleId?: string;
  }) => {
    const variables = {
      input: omit(input, 'circleId'),
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
        circleId: deletedPost.circleId,
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

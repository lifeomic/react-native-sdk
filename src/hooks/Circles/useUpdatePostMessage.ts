import { gql } from 'graphql-request';
import { useQueryClient, useMutation } from 'react-query';
import { useActiveAccount } from '../useActiveAccount';
import { useGraphQLClient } from '../useGraphQLClient';
import { optimisticallyUpdatePosts } from './utils/optimisticallyUpdatePosts';
import omit from 'lodash/omit';

export function useUpdatePostMessage() {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();
  const queryClient = useQueryClient();

  const updatePostMessageMutation = async (input: {
    id: string;
    newMessage: string;
    circleId?: string;
  }) => {
    const variables = {
      input: omit(input, 'circleId'),
    };

    return graphQLClient.request(
      updatePostMessageMutationDocument,
      variables,
      accountHeaders,
    );
  };

  return useMutation('updatePostMessage', updatePostMessageMutation, {
    onMutate: async (updatedPost) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: `posts-${updatedPost.circleId}`,
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      optimisticallyUpdatePosts({
        queryClient,
        id: updatedPost.id,
        circleId: updatedPost.circleId,
        transformFn: (post) => {
          post.message = updatedPost.newMessage;
          return post;
        },
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
  });
}

const updatePostMessageMutationDocument = gql`
  mutation UpdatePostMessage($input: UpdatePostMessageInput!) {
    updatePostMessage(input: $input) {
      post {
        id
        message
      }
    }
  }
`;

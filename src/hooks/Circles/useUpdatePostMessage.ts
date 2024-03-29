import { gql } from 'graphql-request';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useGraphQLClient } from '../useGraphQLClient';
import { optimisticallyUpdatePosts } from './utils/optimisticallyUpdatePosts';
import { useActiveCircleTile } from './useActiveCircleTile';

export function useUpdatePostMessage() {
  const { graphQLClient } = useGraphQLClient();
  const queryClient = useQueryClient();
  const { circleTile } = useActiveCircleTile();

  const updatePostMessageMutation = async (input: {
    id: string;
    newMessage: string;
  }) => {
    const variables = {
      input,
    };

    return graphQLClient.request(updatePostMessageMutationDocument, variables);
  };

  return useMutation(['updatePostMessage'], updatePostMessageMutation, {
    onMutate: async (updatedPost) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['posts', circleTile?.circleId],
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      optimisticallyUpdatePosts({
        queryClient,
        id: updatedPost.id,
        circleId: circleTile?.circleId,
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

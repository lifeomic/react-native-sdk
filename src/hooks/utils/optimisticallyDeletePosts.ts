import { QueryClient } from 'react-query';
import type {
  InfinitePostsData,
  PostDetailsPostQueryResponse,
} from '../usePosts';
import forEach from 'lodash/forEach';
import remove from 'lodash/remove';

type DeletePostsConfig = {
  queryClient: QueryClient;
  postId: string;
};

export const optimisticallyDeletePosts = ({
  queryClient,
  postId,
}: DeletePostsConfig) => {
  queryClient.setQueryData<InfinitePostsData>(['posts'], (currentData) => {
    removeEdgeById(currentData!, postId);
    return currentData!;
  });

  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['postDetails'] })
    .map((query) => {
      query?.setData((currentData: PostDetailsPostQueryResponse) => {
        if (!currentData) {
          return currentData!;
        }

        if (currentData.post.id === postId) {
          return undefined;
        }

        removeRepliesById(currentData, postId);
        return currentData;
      });
    });
};

const removeEdgeById = (currentData: InfinitePostsData, id: string) =>
  forEach(currentData?.pages, (page) => {
    forEach(page.postsV2.edges, (edge) => {
      const deleted = remove(
        edge.node.replies?.edges,
        (replyEdge) => replyEdge.node.id === id,
      );
      edge.node.replyCount -= deleted.length;
    });
    remove(page.postsV2.edges, (edge) => edge.node.id === id);
  });

const removeRepliesById = (
  currentData: PostDetailsPostQueryResponse,
  id: string,
) => {
  const deleted = remove(
    currentData?.post.replies.edges,
    (edge) => edge.node.id === id,
  );
  currentData.post.replyCount -= deleted.length;
};

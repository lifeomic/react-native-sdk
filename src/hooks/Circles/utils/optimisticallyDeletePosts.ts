import { QueryClient } from 'react-query';
import type {
  InfinitePostsData,
  PostDetailsPostQueryResponse,
} from '../useInfinitePosts';
import forEach from 'lodash/forEach';
import remove from 'lodash/remove';
import { Post } from '../types';

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
  depth: number = 7, // set some default max depth
) => {
  let count = 0;
  const recursiveRemove = (post: Post, currentDepth: number) => {
    if (currentDepth > depth) {
      return;
    }

    const deleted = remove(post.replies.edges, (edge) => edge.node.id === id);
    post.replyCount -= deleted.length;

    // Recurse into the replies of the remaining edges
    post.replies.edges.forEach((edge) => {
      if (edge.node.replies && edge.node.replies.edges) {
        recursiveRemove(edge.node, currentDepth + 1);
      }
    });
  };

  if (currentData?.post.replies.edges) {
    recursiveRemove(currentData.post, 0);
  }

  currentData.post.replyCount -= count;
};

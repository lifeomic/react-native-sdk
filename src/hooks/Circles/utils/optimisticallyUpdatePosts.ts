import { QueryClient } from 'react-query';
import type {
  InfinitePostsData,
  PostDetailsPostQueryResponse,
} from '../useInfinitePosts';
import { Post } from '../types';
import forEach from 'lodash/forEach';
import { cloneDeep } from 'lodash';

interface OptimisticallyUpdatePosts {
  queryClient: QueryClient;
  id: string;
  transformFn: (post: Post) => Post;
}

export const optimisticallyUpdatePosts = ({
  queryClient,
  id,
  transformFn,
}: OptimisticallyUpdatePosts) => {
  queryClient.setQueryData<InfinitePostsData>(['posts'], (currentData) => {
    const newData = cloneDeep(currentData);
    forEach(newData?.pages, (page) => {
      transformEdgesById(page.postsV2?.edges, id, transformFn);
    });
    return newData!;
  });

  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['postDetails'] })
    .map((query) => {
      query?.setData(
        (currentData: PostDetailsPostQueryResponse | undefined) => {
          const newData = cloneDeep(currentData);
          if (newData?.post.id === id) {
            newData.post = transformFn(newData.post);
            return newData;
          }
          if (newData?.post.replies?.edges) {
            transformEdgesById(newData.post.replies?.edges, id, transformFn);
          }
          return newData;
        },
      );
    });
};

const transformEdgesById = (
  edges: { node: Post }[],
  id: string,
  transformFn: (post: Post) => Post,
  currentDepth: number = 0,
  maxDepth: number = 10,
): boolean => {
  if (!edges || currentDepth > maxDepth) {
    return false;
  }

  for (const edge of edges) {
    if (edge.node.id === id) {
      edge.node = transformFn(edge.node);
      return true;
    }

    if (edge.node.replies?.edges) {
      const transformed = transformEdgesById(
        edge.node.replies.edges,
        id,
        transformFn,
        currentDepth + 1,
        maxDepth,
      );

      if (transformed) {
        return true;
      }
    }
  }

  return false;
};

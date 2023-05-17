import { QueryClient } from 'react-query';
import type {
  InfinitePostsData,
  PostDetailsPostQueryResponse,
} from '../useInfinitePosts';
import { Post } from '../types';
import forEach from 'lodash/forEach';
import { cloneDeep } from 'lodash';

type UpdatePostsConfig = {
  queryClient: QueryClient;
  id: string;
  transformFn: (post: Post) => Post;
};

export const optimisticallyUpdatePosts = ({
  queryClient,
  id,
  transformFn,
}: UpdatePostsConfig) => {
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
) => {
  if (!edges) {
    return;
  }
  forEach(edges, (edge) => {
    if (edge.node.id === id) {
      edge.node = transformFn(edge.node);
    }
    if (edge.node.replies?.edges) {
      transformEdgesById(edge.node.replies?.edges, id, transformFn);
    }
  });
};

import { QueryClient } from 'react-query';
import type {
  InfinitePostsData,
  PostDetailsPostQueryResponse,
} from '../useInfinitePosts';
import { Post } from '../types';

type UpdatePostsConfig = {
  queryClient: QueryClient;
  postId: string;
  updatePost: (post: Post) => Post;
};

export const optimisticallyUpdatePosts = ({
  queryClient,
  postId,
  updatePost,
}: UpdatePostsConfig) => {
  queryClient.setQueryData<InfinitePostsData>(['posts'], (currentData) => {
    const edge = findEdgeById(currentData!, postId);

    if (!edge.node) {
      return currentData!;
    }

    edge.node = updatePost(edge.node);

    return currentData!;
  });

  const visited: Post[] = [];
  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['postDetails'] })
    .map((query) => {
      query?.setData((currentData: PostDetailsPostQueryResponse) => {
        if (!currentData) {
          return currentData!;
        }

        const posts = extractPosts({ node: currentData.post });

        const node = posts.find((post) => post.node?.id === postId);

        if (node?.node && visited.indexOf(node.node) === -1) {
          visited.push(node.node);
          node.node = updatePost(node.node);
        }

        return currentData;
      });
    });
};

const extractPosts = (post: { node: Post }): { node: Post }[] => [
  post,
  ...((post.node?.replies?.edges.map(extractPosts).flat() ?? []) as {
    node: Post;
  }[]),
];

const findEdgeById = (currentData: InfinitePostsData, id: string) =>
  currentData?.pages
    .map((page) => page.postsV2.edges)
    .flat()
    .find(({ node }) => node.id === id) ?? {
    node: undefined,
  };

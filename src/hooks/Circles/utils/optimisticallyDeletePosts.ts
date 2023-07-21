import { QueryClient } from 'react-query';
import type {
  InfinitePostsData,
  PostDetailsPostQueryResponse,
} from '../useInfinitePosts';
import remove from 'lodash/remove';
import { Post } from '../types';
import { cloneDeep } from 'lodash';

type DeletePostsConfig = {
  queryClient: QueryClient;
  postId: string;
  circleId?: string;
};

export const optimisticallyDeletePosts = ({
  queryClient,
  postId,
  circleId,
}: DeletePostsConfig) => {
  queryClient.setQueryData<InfinitePostsData>(
    `posts-${circleId}`,
    (currentData) => {
      if (!currentData) {
        return currentData!;
      }
      const newData = cloneDeep(currentData);
      for (const page of newData?.pages) {
        const result = deletePostById(page.postsV2.edges, postId);
        if (result) {
          break;
        }
      }

      return newData!;
    },
  );

  queryClient
    .getQueryCache()
    .findAll({ queryKey: ['postDetails'] })
    .forEach((query) => {
      query?.setData((currentData: PostDetailsPostQueryResponse) => {
        if (!currentData) {
          return currentData!;
        }

        if (currentData.post.id === postId) {
          return undefined;
        }

        const newData = cloneDeep(currentData);
        deletePostById(newData.post.replies?.edges, postId);
        return newData;
      });
    });
};

const deletePostById = (
  posts: { node: Post }[],
  postId: string,
  maxDepth: number = 20,
  depth: number = 0,
) => {
  // limit the depth of recursion
  if (depth > maxDepth) {
    return true;
  }

  // Remove the post if it is found in the posts
  const removedPosts = remove(posts, (postObj) => postObj.node.id === postId);

  // If a post was removed, stop here and return true
  if (removedPosts.length > 0) {
    return true;
  }

  // Otherwise, traverse the replies
  for (const { node: post } of posts) {
    const deleted = remove(
      post.replies?.edges,
      (edge) => edge.node.id === postId,
    );
    post.replyCount -= deleted.length;

    // If we've deleted the post in replies, we're done, otherwise, we need to check the replies of replies.
    if (deleted.length > 0) {
      return true;
    }

    if (post.replies?.edges) {
      const result = deletePostById(
        post.replies?.edges,
        postId,
        maxDepth,
        depth + 1,
      );
      // If the post was deleted in the deeper replies, stop the recursion.
      if (result) {
        return true;
      }
    }
  }

  // If the post wasn't found at this level or deeper levels, return false.
  return false;
};

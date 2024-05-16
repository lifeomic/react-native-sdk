import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { gql } from 'graphql-request';
import { useGraphQLClient } from '../useGraphQLClient';
import { AttachmentType, Post, postDetailsFragment } from './types';
import { useUser } from '../useUser';
import { IMessage } from 'react-native-gifted-chat';
import { t } from 'i18next';
import { uniq } from 'lodash';
import uuid from 'react-native-uuid';
import type { Asset } from 'react-native-image-picker';

/**
 * privatePosts
 */
export type InfinitePrivatePostsData = InfiniteData<PrivatePostsData>;
export type PrivatePostsData = PageInfoData & {
  privatePosts: {
    edges: {
      node: Post;
    }[];
  };
};

export type PageInfoData = {
  privatePosts: {
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
    };
  };
};

export type PostDetailsPostQueryResponse = {
  post: Post;
};

export type PostRepliesQueryResponse = {
  post: Pick<Post, 'replies'>;
};

export const postToMessage = (
  post: Partial<Post> & Pick<Post, 'id'>,
): IMessage | IMessage[] => {
  if (!post.authorId) {
    throw Error(
      t(
        'post-to-message-error',
        'Unable to convert post to message, missing required field authorId.',
      ),
    );
  }

  const baseMessage: IMessage = {
    _id: post.id,
    text: post.message || '',
    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
    user: {
      _id: post.authorId,
      name: post.author?.profile.displayName,
      avatar: post.author?.profile.picture,
    },
  };

  const messages = extractAttachments(post, baseMessage).concat(
    breakUpMarkdownImages(baseMessage),
  );

  return messages.reverse();
};

const breakUpMarkdownImages = (message: IMessage) => {
  const markdownImages = message.text.match(/!\[.+\]\(.+\)/g);

  if (!markdownImages) {
    return message.text.length ? [message] : [];
  }

  const messages: IMessage[] = [];
  let text = message.text;

  for (let i = 0; i < markdownImages.length; i++) {
    const imageMarkdown = markdownImages[i];
    const imageUrl = imageMarkdown.match(/!\[.+\]\((.+)\)/)?.[1];
    const parts = text.split(imageMarkdown);
    text = parts[1].trim();

    messages.push({
      ...message,
      _id: `${message._id}-${i}`,
      text: parts[0].trim(),
    });
    messages.push({
      ...message,
      _id: `${message._id}-${i}-image`,
      text: '',
      image: imageUrl,
    });
  }

  if (text.length) {
    messages.push({ ...message, text });
  }

  return messages;
};

const extractAttachments = (post: Partial<Post>, message: IMessage) => {
  const attachments = (post.attachmentsV2?.edges || []).slice();
  attachments.reverse();

  const messages: IMessage[] = [];

  for (const attachment of attachments) {
    if (attachment.node.type === AttachmentType.IMAGE) {
      messages.push({
        ...message,
        _id: attachment.node.externalId,
        text: '',
        image: attachment.node.url,
      });
    }
  }

  return messages;
};

const uniqSort = (userIds: Array<string | undefined>) => {
  return uniq(userIds).sort();
};

/*
  This hook will query continuously so use it sparingly and only
  when absolutely necessary.
*/
export function useInfinitePrivatePosts(userIds: string[]) {
  const { graphQLClient } = useGraphQLClient();
  const { data } = useUser();
  const users = uniqSort([data?.id, ...userIds]);

  const queryPosts = async ({ pageParam }: { pageParam?: string }) => {
    const variables = {
      userIds: users,
      filter: {
        order: 'NEWEST',
      },
      after: pageParam,
    };

    return graphQLClient.request<PrivatePostsData>(
      privatePostsQueryDocument,
      variables,
    );
  };

  return useInfiniteQuery(['privatePosts', ...users], queryPosts, {
    enabled: !!data?.id,
    getNextPageParam: (lastPage) => {
      return lastPage.privatePosts.pageInfo.hasNextPage
        ? lastPage.privatePosts.pageInfo.endCursor
        : undefined;
    },
    refetchInterval: 5000,
    // Continuously polls while query component is focused
    // Switch to Websocket/Subscription model would be an improvement
  });
}

const privatePostsQueryDocument = gql`
  ${postDetailsFragment}

  query PrivatePosts(
    $userIds: [ID!]!
    $filter: PrivatePostFilter!
    $after: String
  ) {
    privatePosts(userIds: $userIds, filter: $filter, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...PostDetails
          replies(order: NEWEST, first: 2) {
            pageInfo {
              endCursor
              hasNextPage
            }
            edges {
              node {
                ...PostDetails
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * CreatePrivatePost
 */
interface CreatePrivatePostMutationProps {
  userIds: string[];
  post: {
    message: string;
    attachmentsV2?: (Attachment & { url: string })[];
  };
}

interface Attachment {
  externalId: string;
  type: AttachmentType;
  subType: string;
  fileName?: string;
}

export function useCreatePrivatePostMutation() {
  const { graphQLClient } = useGraphQLClient();
  const queryClient = useQueryClient();
  const { data: userData } = useUser();

  const createPrivatePostMutation = async ({
    userIds,
    post,
  }: CreatePrivatePostMutationProps) => {
    const variables = {
      input: {
        userIds: uniqSort([userData?.id, ...userIds]),
        post: {
          ...post,
          attachmentsV2: post.attachmentsV2?.map(
            // Omit the url from the attachment, it is only used for updating the cache
            ({ url: _url, ...attachment }) => attachment,
          ),
        },
        createConversation: true,
      },
    };

    return graphQLClient.request(createPrivatePostMutationDocument, variables);
  };

  return useMutation(['createPrivatePost'], {
    mutationFn: createPrivatePostMutation,
    onMutate: async (variables) => {
      const userIds = uniqSort(variables.userIds);
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['privatePosts', ...userIds],
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData([
        ['privatePosts', ...userIds],
      ]);

      queryClient.setQueryData(
        ['privatePosts', ...userIds],
        (currentCache: InfinitePrivatePostsData | undefined) => {
          const post: Partial<Post> = {
            id: uuid.v4().toString(),
            message: variables.post.message,
            createdAt: new Date().toISOString(),
            authorId: userData?.id,
            author: {
              profile: {
                displayName: userData?.profile.displayName!,
                picture: userData?.profile.picture!,
              },
            },
            attachmentsV2: {
              edges:
                variables.post.attachmentsV2?.map((node) => ({
                  node: {
                    externalId: node.externalId,
                    type: AttachmentType[node.type],
                    url: node.url,
                  },
                })) || [],
            },
          };

          const result = currentCache
            ? ({ ...currentCache } as InfinitePrivatePostsData)
            : currentCache;

          // Since this is a new post always append to the first page as the first node
          result?.pages[0].privatePosts.edges.unshift({ node: post as Post });
          return result;
        },
      );

      return { previousPosts };
    },
  });
}

const createPrivatePostMutationDocument = gql`
  mutation CreatePrivatePost($input: CreatePrivatePostInput!) {
    createPrivatePost(input: $input) {
      post {
        id
        message
        createdAt
        author {
          userId
          profile {
            displayName
            picture
          }
        }
      }
      conversationId
    }
  }
`;

/**
 * CreatePrivatePostAttachment
 */
interface CreatePrivatePostAttachmentMutationProps {
  userIds: string[];
  asset: Asset;
}

export interface CreatePrivatePostAttachmentMutationResult {
  id: string;
  fileLocation: {
    permanentUrl: string;
    uploadUrl: string;
  };
}

const getBlob = (uri: string) => fetch(uri).then((res) => res.blob());

export interface CreateAttachmentResponse {
  attachment: Attachment;
  uploadConfig: CreatePrivatePostAttachmentMutationResult;
}

interface UploadImageProps {
  asset: Asset;
  uploadConfig: CreatePrivatePostAttachmentMutationResult;
}

export function useCreatePrivatePostAttachmentMutation() {
  const { graphQLClient } = useGraphQLClient();
  const { data: userData } = useUser();

  const uploadImage = useMutation(['uploadMessageAttachment'], {
    mutationFn: async ({ asset, uploadConfig }: UploadImageProps) => {
      if (!asset.uri) {
        return;
      }

      const blob = await getBlob(asset.uri);
      // Use fetch since the s3 uploadUrl is pre-signed
      await fetch(uploadConfig.fileLocation.uploadUrl, {
        headers: {
          'Content-Type': blob.type,
        },
        method: 'PUT',
        body: blob,
      });

      return uploadConfig;
    },
  });

  const createPrivatePostAttachmentMutation = async ({
    userIds,
    asset,
  }: CreatePrivatePostAttachmentMutationProps) => {
    if (!asset.type) {
      throw Error("Unknown asset type, can't upload");
    }

    const fileType = {
      'image/jpeg': 'JPEG' as const,
      'image/jpg': 'JPG' as const,
      'image/png': 'PNG' as const,
      'image/gif': 'GIF' as const,
    }[asset.type.toLowerCase()];

    if (!fileType) {
      throw Error(`Unsupported file type: ${asset.type}`);
    }

    const variables = {
      input: {
        userIds: uniqSort([userData?.id, ...userIds]),
        fileType,
      },
    };

    const res = await graphQLClient.request(
      createPrivatePostAttachmentMutationDocument,
      variables,
    );

    const attachment: Attachment = {
      externalId: res.privatePostFileUploadUrl.id,
      subType: 's3',
      type: {
        JPEG: AttachmentType.IMAGE,
        JPG: AttachmentType.IMAGE,
        PNG: AttachmentType.IMAGE,
        GIF: AttachmentType.IMAGE,
      }[fileType],
    };

    return {
      attachment,
      uploadConfig: {
        ...res.privatePostFileUploadUrl,
        fileLocation: {
          ...res.privatePostFileUploadUrl.fileLocation,
          permanentUrl: asset.uri,
        },
      },
    };
  };

  return useMutation(['createPrivatePostAttachment'], {
    mutationFn: createPrivatePostAttachmentMutation,
    onSuccess: (data, variables) =>
      uploadImage.mutateAsync({
        asset: variables.asset,
        uploadConfig: data.uploadConfig,
      }),
  });
}

const createPrivatePostAttachmentMutationDocument = gql`
  mutation CreatePrivatePostAttachment($input: PrivatePostFileUploadUrlInput!) {
    privatePostFileUploadUrl(input: $input) {
      id
      fileLocation {
        permanentUrl
        uploadUrl
      }
    }
  }
`;

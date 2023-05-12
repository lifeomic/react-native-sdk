import React from 'react';
import { IconButton } from 'react-native-paper';
import { useUser } from '../../hooks';
import {
  ParentType,
  Post as PostType,
  useDeletePost,
} from '../../hooks/usePosts';
import { t } from 'i18next';
import { showCreateEditPostModal } from './CreateEditPostModal';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { isNumber } from 'lodash';

interface PostProps {
  post: PostType;
  parentType: ParentType;
}

export const ShowPostMenuButton = ({ post, parentType }: PostProps) => {
  const { data } = useUser();
  const deletePost = useDeletePost();
  const { showActionSheetWithOptions } = useActionSheet();

  // For now only render this button on your own posts
  if (data?.id && data.id !== post.authorId) {
    return null;
  }

  const onPress = () => {
    const actions = [
      {
        label:
          parentType === ParentType.CIRCLE
            ? t('delete-post', 'Delete Post')
            : t('delete-comment', 'Delete Comment'),
        action: () => deletePost.mutate({ id: post.id }),
      },
      {
        label:
          parentType === ParentType.CIRCLE
            ? t('edit-post', 'Edit Post')
            : t('edit-comment', 'Edit Comment'),
        action: () =>
          showCreateEditPostModal({
            parentId: post.id,
            parentType: parentType,
            postToEdit: post,
          }),
      },
      {
        label: t('cancel', 'Cancel'),
      },
    ];

    showActionSheetWithOptions(
      {
        options: actions.map((a) => a.label),
        destructiveButtonIndex: [0],
        cancelButtonIndex: 2,
      },
      (selectedIndex?: number) => {
        if (isNumber(selectedIndex)) {
          actions[selectedIndex].action?.();
        }
      },
    );
  };

  return <IconButton icon="dots-horizontal" onPress={onPress} />;
};

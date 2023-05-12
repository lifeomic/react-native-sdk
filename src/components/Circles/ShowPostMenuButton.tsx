import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { useUser } from '../../hooks';
import {
  ParentType,
  Post as PostType,
  useDeletePost,
} from '../../hooks/usePosts';
import { t } from 'i18next';
import { Actions, ActionsModal } from '../ActionsModal';
import { showCreateEditPostModal } from './CreateEditPostModal';

interface PostProps {
  post: PostType;
  parentType: ParentType;
}

export const ShowPostMenuButton = ({ post, parentType }: PostProps) => {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const { data } = useUser();
  const deletePost = useDeletePost();

  // For now only render this button on your own posts
  if (data?.id && data.id !== post.authorId) {
    return null;
  }

  const actions: Actions = [
    {
      title:
        parentType === ParentType.CIRCLE
          ? t('edit-post', 'Edit Post')
          : t('edit-comment', 'Edit Comment'),
      action: () => {
        showCreateEditPostModal({
          parentId: post.id,
          parentType: parentType,
          postToEdit: post,
        });
      },
    },
  ];

  actions.push({
    title:
      parentType === ParentType.CIRCLE
        ? t('delete-post', 'Delete Post')
        : t('delete-comment', 'Delete Comment'),
    action: () => deletePost.mutate({ id: post.id }),
    promptForConfirmation: true,
  });

  return (
    <>
      {showPostMenu && (
        <ActionsModal setShowModal={setShowPostMenu} actions={actions} />
      )}
      <IconButton
        icon="dots-horizontal"
        onPress={() => setShowPostMenu((currentValue) => !currentValue)}
      />
    </>
  );
};

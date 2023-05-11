import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { useUser } from '../../hooks';
import { Post as PostType, useDeletePost } from '../../hooks/usePosts';
import { t } from 'i18next';
import { Actions, ActionsModal } from '../ActionsModal';

interface PostProps {
  post: PostType;
}

export const ShowPostMenuButton = ({ post }: PostProps) => {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const { data } = useUser();
  const deletePost = useDeletePost();
  const actions: Actions = [{ title: t('edit-post', 'Edit Post') }];

  if (data?.id && data.id === post.authorId) {
    actions.push({
      title: t('delete-post', 'Delete Post'),
      action: () => deletePost.mutate({ id: post.id }),
      promptForConfirmation: true,
    });
  }

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

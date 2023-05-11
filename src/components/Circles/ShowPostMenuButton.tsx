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
import { CreateEditPostModal } from './CreateEditPostModal';

interface PostProps {
  post: PostType;
  parentType: ParentType;
}

export const ShowPostMenuButton = ({ post, parentType }: PostProps) => {
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data } = useUser();
  const deletePost = useDeletePost();
  const actions: Actions = [
    {
      title: t('edit-post', 'Edit Post'),
      action: () => {
        console.log('Clicked!');
        setShowEditModal(true);
      },
    },
  ];

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
      {showEditModal && (
        <CreateEditPostModal
          parentId={post.parentId}
          parentType={parentType}
          postToEdit={post}
          setVisible={setShowEditModal}
          visible={true}
        />
      )}
      <IconButton
        icon="dots-horizontal"
        onPress={() => setShowPostMenu((currentValue) => !currentValue)}
      />
    </>
  );
};

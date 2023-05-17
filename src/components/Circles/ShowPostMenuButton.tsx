import React from 'react';
import { IconButton } from 'react-native-paper';
import { useStyles, useUser } from '../../hooks';
import { ParentType, Post, useDeletePost } from '../../hooks';
import { t } from 'i18next';
import { showCreateEditPostModal } from './CreateEditPostModal';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { isNumber } from 'lodash';
import { createStyles } from '../BrandConfigProvider';

interface PostProps {
  post: Post;
  parentType: ParentType;
  styles?: ShowPostMenuButtonStyle;
}

export const ShowPostMenuButton = ({
  post,
  parentType,
  styles: instanceStyles,
}: PostProps) => {
  const { data } = useUser();
  const deletePost = useDeletePost();
  const { showActionSheetWithOptions } = useActionSheet();
  const { styles } = useStyles(defaultStyles, instanceStyles);

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
        action: () => {
          deletePost.mutate({ id: post?.id });
        },
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

  return (
    <IconButton
      icon="dots-horizontal"
      onPress={onPress}
      style={styles.iconButton}
    />
  );
};

const defaultStyles = createStyles('ShowPostMenuButton', () => ({
  iconButton: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ShowPostMenuButtonStyle = NamedStylesProp<typeof defaultStyles>;

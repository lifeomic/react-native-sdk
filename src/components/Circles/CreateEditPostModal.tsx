import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, Modal } from 'react-native';
import {
  Appbar,
  Button,
  Portal,
  TextInput,
  Text,
  Provider,
} from 'react-native-paper';
import { ParentType, useCreatePost, Post } from '../../hooks/usePosts';
import { useStyles } from '../../hooks';
import { createStyles } from '../BrandConfigProvider';
import { t } from 'i18next';
import { tID } from '../../common';
import uuid from 'react-native-uuid';

interface CreateEditPostModalProps {
  parentId: string;
  parentType: ParentType;
  visible: boolean;
  setVisible: (arg: boolean) => void;
  postToEdit?: Post;
}

export const CreateEditPostModal = ({
  parentId,
  parentType,
  visible,
  setVisible,
  postToEdit,
}: CreateEditPostModalProps) => {
  const createPost = useCreatePost();
  const hideModal = () => {
    setPostText('');
    setCharacterCount(0);
    setVisible(false);
  };

  const [postText, setPostText] = useState(postToEdit?.message ?? '');
  const [characterCount, setCharacterCount] = useState(postText.length);
  const overCharacterLimit = characterCount > 1200;
  const { styles } = useStyles(defaultStyles);

  if (!parentType || !parentId) {
    return null;
  }

  return (
    <Provider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          style={styles.modal}
          animationType={'slide'}
        >
          <View style={styles.container}>
            <Appbar.Header style={styles.header}>
              <Appbar.BackAction onPress={hideModal} />
              <Appbar.Content
                title={t('create-post-modal-title', 'Create Post')}
              />
            </Appbar.Header>
            <TextInput
              autoFocus
              testID={tID('post-text-input')}
              multiline
              numberOfLines={12}
              placeholder={t(
                'create-post-placeholder-text',
                'What do you want to share?',
              )}
              style={styles.textArea}
              onChangeText={(text: string) => {
                setPostText(text);
                setCharacterCount(text.length);
              }}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 40}
              style={styles.toolbarContainer}
            >
              <View style={styles.rightToolbarContainer}>
                <Text
                  style={
                    overCharacterLimit
                      ? [styles.characterCountLabel, styles.overLimitLabel]
                      : styles.characterCountLabel
                  }
                >{`${characterCount}/1200`}</Text>
                <Button
                  testID={tID('create-post-button')}
                  compact={true}
                  style={styles.postButton}
                  labelStyle={styles.postButtonLabel}
                  disabled={characterCount === 0 || overCharacterLimit}
                  mode="outlined"
                  onPress={() => {
                    createPost.mutate({
                      post: {
                        id: uuid.v4().toString(),
                        message: postText,
                        parentId: parentId,
                        parentType: parentType,
                      },
                    });
                    hideModal();
                  }}
                >
                  Post
                </Button>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Portal>
    </Provider>
  );
};

const defaultStyles = createStyles('CreateEditPostModal', (theme) => ({
  modal: {
    marginTop: 0,
    marginBottom: 0,
  },
  container: {
    height: '100%',
    flex: 1,
  },
  header: {},
  textArea: {
    width: '100%',
    flexGrow: 1,
  },
  toolbarContainer: {
    backgroundColor: theme.colors.surface,
    width: '100%',
    height: 60,
    flex: 1,
    flexGrow: 0.1,
    paddingBottom: 8,
  },
  rightToolbarContainer: {
    paddingTop: theme.spacing.medium,
    columnGap: theme.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  characterCountLabel: {
    color: theme.colors.outline,
    textAlign: 'center',
  },
  overLimitLabel: {
    color: theme.colors.error,
  },
  postButton: {
    marginRight: theme.spacing.medium,
    height: 25,
    width: 55,
  },
  postButtonLabel: {
    color: theme.colors.text,
    marginVertical: 0,
    paddingTop: 4,
    fontSize: 14,
    lineHeight: 16,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CreateEditPostModalStyles = NamedStylesProp<typeof defaultStyles>;

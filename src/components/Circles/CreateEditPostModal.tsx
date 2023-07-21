import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, View, Modal } from 'react-native';
import {
  Appbar,
  Button,
  Portal,
  TextInput,
  Text,
  Provider,
} from 'react-native-paper';
import {
  ParentType,
  useCreatePost,
  Post,
  useUpdatePostMessage,
} from '../../hooks';
import { useStyles } from '../../hooks/useStyles';
import { createStyles } from '../BrandConfigProvider';
import { t } from 'i18next';
import { tID } from '../../common/testID';
import uuid from 'react-native-uuid';
import { NativeEventEmitter } from 'react-native';

const eventEmitter = new NativeEventEmitter({
  addListener: () => {},
  removeListeners: () => {},
});

const showCreateEditPostModelEvent = 'showCreateEditPostModelEvent';

type EmitEventProps = {
  parentId?: string;
  parentType?: ParentType;
  onModalClose?: (createdNewPost?: boolean) => void;
  postToEdit?: Post;
};

export const showCreateEditPostModal = (props: EmitEventProps) =>
  eventEmitter.emit(showCreateEditPostModelEvent, props);

export const CreateEditPostModal = () => {
  const createPost = useCreatePost();
  const updatePost = useUpdatePostMessage();
  const [visible, setVisible] = useState(false);
  const [emitProps, setEmitProps] = useState<EmitEventProps | null>();
  const [characterCount, setCharacterCount] = useState(0);
  const [postText, setPostText] = useState('');

  const hideModal = (createdNewPost?: boolean) => {
    setPostText('');
    setCharacterCount(0);
    setEmitProps(null);
    onModalClose?.(createdNewPost);
  };

  const overCharacterLimit = characterCount > 1200;
  const { styles } = useStyles(defaultStyles);

  useEffect(() => {
    const subscription = eventEmitter.addListener(
      showCreateEditPostModelEvent,
      (props: EmitEventProps) => {
        setEmitProps(props);
        setCharacterCount(props?.postToEdit?.message?.length ?? 0);
        setVisible(true);
        setPostText(props?.postToEdit?.message ?? '');
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (!emitProps) {
    return null;
  }

  const { parentId, parentType, postToEdit, onModalClose } = emitProps;

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
              <Appbar.BackAction onPress={() => hideModal(false)} />
              <Appbar.Content
                title={t('create-post-modal-title', 'Create Post')}
              />
            </Appbar.Header>

            <KeyboardAvoidingView
              behavior="padding"
              style={styles.contentContainer}
            >
              <TextInput
                autoFocus
                testID={tID('post-text-input')}
                multiline
                numberOfLines={12}
                defaultValue={postToEdit?.message}
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
              <View style={styles.toolbarContainer}>
                <Text
                  style={
                    overCharacterLimit
                      ? [styles.characterCountLabel, styles.overLimitLabel]
                      : styles.characterCountLabel
                  }
                >
                  {t('post-character-limit', '{{count}}/1200', {
                    count: characterCount,
                  })}
                </Text>
                <Button
                  testID={tID('create-post-button')}
                  compact={true}
                  style={styles.postButton}
                  labelStyle={styles.postButtonLabel}
                  disabled={characterCount === 0 || overCharacterLimit}
                  mode="outlined"
                  onPress={() => {
                    if (postToEdit) {
                      updatePost.mutate({
                        id: postToEdit.id,
                        newMessage: postText,
                      });
                      hideModal(false);
                    } else {
                      createPost.mutate({
                        post: {
                          id: uuid.v4().toString(),
                          message: postText,
                          parentId: parentId!,
                          parentType: parentType!,
                        },
                      });
                      hideModal(true);
                    }
                  }}
                >
                  {postToEdit
                    ? t('done-editing', 'Done')
                    : t('submit-post', 'Post')}
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
    flex: 1,
  },
  contentContainer: {
    backgroundColor: theme.colors.surface,
    width: '100%',
    flex: 1,
    paddingBottom: 8,
  },
  toolbarContainer: {
    paddingVertical: theme.spacing.medium,
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

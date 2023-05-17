import React, { Ref, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
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

type CreatePostToolbarProps = {
  parentId?: string;
  parentType?: ParentType;
  postToEdit?: Post;
  onSubmit?: (arg: boolean) => void;
  textInputRef?: Ref<any>;
};

export const CreatePostToolbar = ({
  parentId,
  parentType,
  postToEdit,
  onSubmit,
  textInputRef,
}: CreatePostToolbarProps) => {
  const createPost = useCreatePost();
  const updatePost = useUpdatePostMessage();
  const [characterCount, setCharacterCount] = useState(0);
  const [postText, setPostText] = useState('');
  const overCharacterLimit = characterCount > 1200;
  const { styles } = useStyles(defaultStyles);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.toolbarContainer}
        keyboardVerticalOffset={160}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <TextInput
              style={styles.addCommentText}
              mode={'outlined'}
              multiline
              numberOfLines={1}
              placeholder={t('thread-screen-add-comment', 'Add a comment')}
              onChangeText={(text: string) => {
                setPostText(text);
                setCharacterCount(text.length);
              }}
              dense
              value={postText}
              clearButtonMode={'always'}
              ref={textInputRef}
            />

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
                  Keyboard.dismiss();
                  setPostText('');
                  setCharacterCount(0);
                  if (postToEdit) {
                    updatePost.mutate({
                      id: postToEdit.id,
                      newMessage: postText,
                    });
                    onSubmit?.(false);
                  } else {
                    createPost.mutate({
                      post: {
                        id: uuid.v4().toString(),
                        message: postText,
                        parentId: parentId!,
                        parentType: parentType!,
                      },
                    });
                    onSubmit?.(true);
                  }
                }}
              >
                {postToEdit
                  ? t('done-editing', 'Done')
                  : t('submit-post', 'Post')}
              </Button>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

const defaultStyles = createStyles('CreatePostToolbar', (theme) => ({
  textArea: {
    width: '100%',
    flexGrow: 1,
  },
  toolbarContainer: {
    backgroundColor: theme.colors.card,
    flex: 0.08,
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
  addCommentText: {
    lineHeight: 16,
    fontSize: 14,
    width: '90%',
    alignSelf: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type CreateEditPostModalStyles = NamedStylesProp<typeof defaultStyles>;

import React, { Ref, useState } from 'react';
import { Keyboard, View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { ParentType, useCreatePost } from '../../hooks';
import { useStyles } from '../../hooks/useStyles';
import { createStyles } from '../BrandConfigProvider';
import { t } from 'i18next';
import { tID } from '../../common/testID';
import uuid from 'react-native-uuid';

type CreatePostToolbarProps = {
  parentId?: string;
  circleId?: string;
  parentType?: ParentType;
  onSubmit?: ({ shouldScroll }: { shouldScroll: boolean }) => void;
  textInputRef?: Ref<any>;
  rootPostId?: string;
};

export const CreatePostToolbar = ({
  parentId,
  parentType,
  circleId,
  onSubmit,
  textInputRef,
  rootPostId,
}: CreatePostToolbarProps) => {
  const createPost = useCreatePost();
  const [characterCount, setCharacterCount] = useState(0);
  const [postText, setPostText] = useState('');
  const overCharacterLimit = characterCount > 1200;
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.toolbarContainer}>
      <TextInput
        style={styles.addCommentText}
        mode={'outlined'}
        multiline
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
            Keyboard.dismiss();
            setPostText('');
            setCharacterCount(0);
            createPost.mutate({
              post: {
                id: uuid.v4().toString(),
                message: postText,
                parentId: parentId!,
                parentType: parentType!,
                circle: { id: circleId! },
              },
            });
            // only scroll to end when commenting on the root post
            onSubmit?.({ shouldScroll: rootPostId === parentId });
          }}
        >
          {t('submit-post', 'Post')}
        </Button>
      </View>
    </View>
  );
};

const defaultStyles = createStyles('CreatePostToolbar', (theme) => ({
  textArea: {
    width: '100%',
  },
  toolbarContainer: {
    backgroundColor: theme.colors.card,
  },
  rightToolbarContainer: {
    paddingTop: theme.spacing.medium,
    columnGap: theme.spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingBottom: 8,
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

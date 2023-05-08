import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useStyles, useUser } from '../../hooks';
import type { Post } from '../../hooks/usePosts';
import { createStyles } from '../BrandConfigProvider';
import EmojiPicker from 'rn-emoji-keyboard';
import {
  useCreateReactionMutation,
  useUndoReactionMutation,
} from '../../hooks/useReactionMutations';
import { tID } from '../../common';

interface ReactionsToolbarProps {
  post: Post;
}

export const ReactionsToolbar = ({ post }: ReactionsToolbarProps) => {
  const createReaction = useCreateReactionMutation();
  const undoReaction = useUndoReactionMutation();
  const { data } = useUser();
  const [localReactions, setLocalReactions] = useState(post.reactionTotals);
  const [showPicker, setShowPicker] = useState(false);
  const { styles } = useStyles(defaultStyles);

  const handleEmojiSelection = useCallback(
    (emojiType: string | null) => {
      if (emojiType === null || !post.id || !data?.id) {
        return;
      }

      const reactionIndex = localReactions.findIndex(
        (r) => r.type === emojiType,
      );

      // if the reaction type doesn't exist locally
      if (reactionIndex < 0) {
        setLocalReactions((reactions) => [
          ...reactions,
          { type: emojiType, count: 1, userHasReacted: true },
        ]);
        createReaction.mutate({ postId: post.id, type: emojiType });
        return;
      }

      // reaction exists locally but current user has not reacted
      if (!localReactions[reactionIndex].userHasReacted) {
        setLocalReactions((reactions) => {
          reactions[reactionIndex].count += 1;
          reactions[reactionIndex].userHasReacted = true;
          return reactions;
        });
        createReaction.mutate({ postId: post.id, type: emojiType });
        return;
      }

      // reaction exists locally and user has already reacted
      if (localReactions[reactionIndex].userHasReacted) {
        setLocalReactions((reactions) => {
          reactions[reactionIndex].count -= 1;
          reactions[reactionIndex].userHasReacted = false;
          return reactions;
        });
        undoReaction.mutate({
          userId: data.id,
          postId: post.id,
          type: emojiType,
        });
        return;
      }
    },
    [data?.id, localReactions, post.id, createReaction, undoReaction],
  );

  return (
    <View style={styles.reactionToolbarContainer}>
      <EmojiPicker
        onEmojiSelected={(selection) => {
          handleEmojiSelection(selection.emoji);
          setShowPicker((currentVal) => !currentVal);
        }}
        open={showPicker}
        onClose={() => setShowPicker(false)}
      />
      <IconButton
        testID={tID('select-emoji-button')}
        size={20}
        icon="emoticon-happy-outline"
        iconColor={'rgba(0, 0, 0, .2)'}
        style={styles.addReactionButton}
        onPress={() => setShowPicker((currentVal) => !currentVal)}
      />
      {localReactions.map((reaction) => {
        if (reaction.count) {
          return (
            <View
              key={`${post.id}-${reaction.type}`}
              style={styles.reactionContainer}
            >
              <Button
                testID={tID(`${reaction.type}-button`)}
                mode="contained"
                compact={true}
                onPress={() => {
                  handleEmojiSelection(reaction.type);
                }}
                style={styles.reactionContainer}
                contentStyle={styles.reactionContent}
                labelStyle={styles.reactionLabel}
              >
                {reaction.type} {reaction.count}
              </Button>
            </View>
          );
        }
      })}
    </View>
  );
};

const defaultStyles = createStyles('ReactionsToolbar', (theme) => ({
  reactionToolbarContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  addReactionButton: {
    height: 20,
    width: 20,
  },
  emojiPickerContainer: {
    backgroundColor: 'white',
    height: '80%',
  },
  reactionContainer: {
    paddingRight: theme.spacing.micro,
  },
  reactionContent: {
    height: 30,
  },
  reactionLabel: {
    paddingTop: 4,
    paddingBottom: 14,
    fontSize: 14,
    lineHeight: 14,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ReactionsToolbarStyle = NamedStylesProp<typeof defaultStyles>;

import { formatRelative } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  Text,
  Portal,
} from 'react-native-paper';
import { useStyles } from '../../hooks';
import { ActivePost } from '../../hooks/useInfinitePosts';
import { createStyles } from '../BrandConfigProvider';
import EmojiModal from 'react-native-emoji-modal';

interface PostProps {
  post: ActivePost;
}

export const Post = ({ post }: PostProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const { styles } = useStyles(defaultStyles);
  const avatarIcon = useMemo(
    () =>
      post.author.profile.picture ? (
        <Avatar.Image
          size={50}
          style={styles.icon}
          source={{ uri: post.author.profile.picture }}
        />
      ) : (
        <Avatar.Icon size={50} style={styles.icon} icon={'account'} />
      ),
    [post.author.profile.picture, styles.icon],
  );
  return (
    <View style={styles.container}>
      {showPicker && (
        <Portal>
          <EmojiModal
            columns={7}
            onEmojiSelected={() => {
              // TODO: Post mutation to add new reaction
              setShowPicker((currentVal) => !currentVal);
            }}
            onPressOutside={() => {
              setShowPicker((currentVal) => !currentVal);
            }}
          />
        </Portal>
      )}
      <List.Item
        title={post.author.profile.displayName}
        description={formatRelative(new Date(post.createdAt), new Date())}
        titleNumberOfLines={4}
        style={styles.listItem}
        left={() => avatarIcon}
      />
      <Text variant="titleMedium" style={styles.messageText}>
        {post.message}
      </Text>
      <View style={styles.reactionControlsContainer}>
        <Button
          style={styles.commentButton}
          contentStyle={styles.commentButtonContainer}
          labelStyle={styles.commentButtonText}
          compact={true}
          mode={'outlined'}
          onPress={() => {}} // TODO: Navigate to post details/comments page
        >
          {post.replyCount} COMMENTS
        </Button>
        <IconButton
          size={20}
          icon="emoticon-happy-outline"
          iconColor={'rgba(0, 0, 0, .2)'}
          style={styles.addReactionButton}
          onPress={() => setShowPicker((currentVal) => !currentVal)}
        />
        {post.reactionTotals.map((reaction, i) => {
          if (reaction.count) {
            return (
              <View key={i} style={styles.reactionContainer}>
                <Button
                  mode="contained"
                  compact={true}
                  onPress={() => {}} //TODO: Post mutation to either increment or remove reaction
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
      <Divider />
    </View>
  );
};

const defaultStyles = createStyles('Post', (theme) => ({
  container: {},
  listItem: { paddingLeft: theme.spacing.small },
  icon: {},
  messageText: {
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.tiny,
  },
  reactionControlsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: theme.spacing.extraSmall,
    marginBottom: theme.spacing.small,
  },
  commentButtonContainer: {},
  commentButton: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  commentButtonText: {
    color: 'rgba(0, 0, 0, 0.4)',
    fontSize: 8,
    lineHeight: 10,
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

export type PostStyle = NamedStylesProp<typeof defaultStyles>;

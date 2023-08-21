import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat';
import {
  useInfinitePrivatePosts,
  useCreatePrivatePostMutation,
  postToMessage,
} from '../hooks/Circles/usePrivatePosts';
import { useDirectMessageEndCursor, useStyles, useUser } from '../hooks';
import {
  ActivityIndicatorView,
  ActivityIndicatorViewStyles,
  createStyles,
} from '../components';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';

export function DirectMessagesScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/DirectMessage'>) {
  const { recipientUserId, displayName } = route.params;
  const { styles } = useStyles(defaultStyles);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: displayName,
    });
  }, [navigation, displayName]);

  const { data: userData, isLoading: userLoading } = useUser();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePrivatePosts(recipientUserId);
  const { setEndCursor } = useDirectMessageEndCursor(
    userData?.id!, // Guarded against ! in useEffect
    recipientUserId,
  );

  // Store endCursor so we can calculate
  // when there are unread messages
  useEffect(() => {
    if (userData?.id && data?.pages[0].privatePosts.pageInfo.endCursor) {
      setEndCursor(data?.pages[0].privatePosts.pageInfo.endCursor);
    }
  }, [data?.pages, setEndCursor, userData?.id]);

  const { mutateAsync } = useCreatePrivatePostMutation();

  const onSend = useCallback(
    (newMessages: IMessage[] = [], userId: string) => {
      newMessages.map((m) => {
        mutateAsync({
          userIds: { currentUserId: userId, recipientUserId },
          post: { message: m.text },
        });
      });
    },
    [mutateAsync, recipientUserId],
  );

  const loadingIndicator = (
    <ActivityIndicatorView
      message={t('direct-message-loading', 'Loading messages')}
      style={styles.activityIndicator}
    />
  );

  if (userLoading || isLoading || !userData?.id) {
    return loadingIndicator;
  }

  // Map all available posts/pages into a flat messages object
  const incomingMessages = data?.pages?.flatMap((page) =>
    page.privatePosts.edges.flatMap((edge) => postToMessage(edge.node)),
  );

  return (
    <GiftedChat
      renderLoading={() => loadingIndicator}
      messages={incomingMessages}
      loadEarlier={hasNextPage}
      onLoadEarlier={() => {
        if (hasNextPage && !isLoading) {
          fetchNextPage();
        }
      }}
      isLoadingEarlier={isFetchingNextPage}
      onSend={(m) => onSend(m, userData.id)}
      user={{
        _id: userData.id,
      }}
      messagesContainerStyle={styles.messagesContainerStyle}
      renderBubble={(props) => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              left: styles.leftMessageView,
              right: styles.rightMessageView,
            }}
            textStyle={{
              left: styles.leftText,
              right: styles.rightText,
            }}
          />
        );
      }}
    />
  );
}

const defaultStyles = createStyles('DirectMessagesScreen', (theme) => ({
  activityIndicator: {
    view: {
      backgroundColor: theme.colors.elevation.level1,
    },
  } as ActivityIndicatorViewStyles,
  messagesContainerStyle: {
    backgroundColor: theme.colors.elevation.level1,
  },
  rightMessageView: {
    backgroundColor: theme.colors.primary,
  },
  leftMessageView: {
    backgroundColor: theme.colors.primaryContainer,
  },
  leftText: { ...theme.fonts.bodyMedium },
  rightText: { ...theme.fonts.bodyMedium },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

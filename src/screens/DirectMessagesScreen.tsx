import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { Bubble, GiftedChat, IMessage } from 'react-native-gifted-chat';
import {
  useInfinitePrivatePosts,
  useCreatePrivatePostMutation,
  postToMessage,
} from '../hooks/Circles/usePrivatePosts';
import { useStyles, useUser } from '../hooks';
import { createStyles } from '../components';
import { ActivityIndicator } from 'react-native-paper';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { useAsyncStorage } from '../hooks/useAsyncStorage';

export function DirectMessagesScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/DirectMessage'>) {
  const { recipientUserId } = route.params;
  const { styles } = useStyles(defaultStyles);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('direct-messages-title', { userId: recipientUserId }),
    });
  }, [navigation, recipientUserId]);

  const { data: userData } = useUser();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePrivatePosts(recipientUserId);
  const [_, setEndCursor] = useAsyncStorage(
    `${userData?.id}-${recipientUserId}-endCursor`,
  );

  // Store endCursor so we can calculate
  // when there are unread messages
  useEffect(() => {
    if (data?.pages[0].privatePosts.pageInfo.endCursor) {
      setEndCursor(data?.pages[0].privatePosts.pageInfo.endCursor);
    }
  }, [data?.pages, setEndCursor]);

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

  if (!userData?.id || isLoading) {
    return <ActivityIndicator />;
  }

  // Map all available posts/pages into a flat messages object
  const incomingMessages = data?.pages?.flatMap((page) =>
    page.privatePosts.edges.flatMap((edge) => postToMessage(edge.node)),
  );

  return (
    <GiftedChat
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

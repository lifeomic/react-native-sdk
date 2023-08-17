import React, { useCallback, useLayoutEffect } from 'react';
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

export function DirectMessagesScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/DirectMessage'>) {
  const { recipientUserId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('direct-messages-title', { userId: recipientUserId }),
    });
  }, [navigation, recipientUserId]);
  const { styles } = useStyles(defaultStyles);

  const { data: userData } = useUser();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePrivatePosts(recipientUserId);
  const incomingMessages = data?.pages?.flatMap((page) =>
    page.privatePosts.edges.flatMap((edge) => postToMessage(edge.node)),
  );
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

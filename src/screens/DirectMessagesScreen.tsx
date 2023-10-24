import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Bubble,
  Composer,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import {
  useInfinitePrivatePosts,
  useCreatePrivatePostMutation,
  postToMessage,
} from '../hooks/Circles/usePrivatePosts';
import { useUser } from '../hooks/useUser';
import { useStyles } from '../hooks/useStyles';
import {
  ActivityIndicatorView,
  ActivityIndicatorViewStyles,
} from '../components/ActivityIndicatorView';
import { createStyles, useIcons } from '../components/BrandConfigProvider';
import { HomeStackScreenProps } from '../navigators/types';
import { t } from 'i18next';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

export function DirectMessagesScreen({
  navigation,
  route,
}: HomeStackScreenProps<'Home/DirectMessage'>) {
  const { recipientUserId, displayName } = route.params;
  const { styles } = useStyles(defaultStyles);
  const { markMessageRead } = useUnreadMessages();
  const userId = useRef<string>();
  const { Send: SendIcon } = useIcons();
  const textLength = useRef<number>(0);

  useEffect(() => {
    if (userId.current !== recipientUserId) {
      userId.current = recipientUserId;
      markMessageRead?.(recipientUserId);
    }
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: displayName,
    });
  }, [navigation, displayName]);

  const { data: userData, isLoading: userLoading } = useUser();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePrivatePosts(recipientUserId);

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
      placeholder={t('message-placeholder', 'Write Your Message')}
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
      renderInputToolbar={(props) => {
        return (
          <InputToolbar
            {...props}
            containerStyle={[
              styles.textInputContainer,
              textLength.current === 0
                ? styles.textInputBorder?.disabled
                : styles.textInputBorder?.enabled,
            ]}
          />
        );
      }}
      renderComposer={(props) => {
        return (
          <Composer
            {...props}
            textInputStyle={styles.inputTextStyle}
            placeholderTextColor={styles.placeholderText?.color?.toString()}
          />
        );
      }}
      renderSend={(props) => {
        textLength.current = props.text?.length ?? 0;
        const iconColor =
          props.text?.length === 0
            ? styles.sendIconColor?.disabled
            : styles.sendIconColor?.enabled;

        return (
          <Send
            {...props}
            containerStyle={styles.sendButtonContainer}
            alwaysShowSend
          >
            <SendIcon color={iconColor} />
          </Send>
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
    backgroundColor: theme.colors.elevation.level0,
    paddingBottom: theme.spacing.large,
  },
  rightMessageView: {
    backgroundColor: theme.colors.primary,
  },
  leftMessageView: {
    backgroundColor: theme.colors.primaryContainer,
  },
  leftText: { ...theme.fonts.bodyMedium },
  rightText: { ...theme.fonts.bodyMedium },
  textInputContainer: {
    width: '90%',
    marginBottom: theme.spacing.medium,
    marginLeft: 20,
  },
  textInputBorder: {
    enabled: {
      borderColor: theme.colors.primary,
      borderTopColor: theme.colors.primary,
      borderTopWidth: 1.1,
      borderWidth: 1,
    },
    disabled: {
      borderColor: theme.colors.primaryContainer,
      borderTopColor: theme.colors.primaryContainer,
      borderTopWidth: 1.1,
      borderWidth: 1,
    },
  },
  inputTextStyle: {},
  sendButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: theme.spacing.small,
  },
  sendIconColor: {
    enabled: theme.colors.primary,
    disabled: theme.colors.primaryContainer,
  },
  placeholderText: {
    color: theme.colors.surfaceDisabled,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

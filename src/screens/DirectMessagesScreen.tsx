import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  Bubble,
  Composer,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
  Time,
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
import { t } from 'i18next';
import {
  useInfiniteConversations,
  useMarkAsRead,
} from '../hooks/useConversations';
import { User } from '../types';
import { ScreenProps } from './utils/stack-helpers';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

export type DirectMessageParams = {
  users: User[];
  conversationId: string;
};

export const DirectMessagesScreen = ({
  navigation,
  route,
}: ScreenProps<DirectMessageParams>) => {
  const { users, conversationId } = route.params;
  const { styles } = useStyles(defaultStyles);
  const { Send: SendIcon } = useIcons();
  const textLength = useRef<number>(0);
  const { mutateAsync: markAsRead } = useMarkAsRead();
  const { data: conversations } = useInfiniteConversations();
  const { data: userData, isLoading: userLoading } = useUser();
  const tabsHeight = useBottomTabBarHeight();
  const otherProfiles = users.filter((user) => user.id !== userData?.id);

  useEffect(() => {
    const conversation = conversations?.pages
      .flat()
      .flatMap((data) => data.conversations.edges)
      .find(({ node }) => node.conversationId === conversationId)?.node;

    if (conversation?.hasUnread) {
      markAsRead({ conversationId });
    }
  }, [conversationId, conversations?.pages, markAsRead]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: otherProfiles.map((user) => user.profile.displayName).join(', '),
    });
  }, [navigation, otherProfiles]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfinitePrivatePosts(users.map((user) => user.id));

  const { mutateAsync } = useCreatePrivatePostMutation();

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      newMessages.map((m) => {
        mutateAsync({
          userIds: users.map((user) => user.id),
          post: { message: m.text },
        });
      });
    },
    [mutateAsync, users],
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
      renderUsernameOnMessage={otherProfiles.length > 1}
      placeholder={t('message-placeholder', 'Write Your Message')}
      isLoadingEarlier={isFetchingNextPage}
      onSend={(m) => onSend(m)}
      user={{
        _id: userData.id,
      }}
      bottomOffset={Platform.select({ ios: tabsHeight })}
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
            usernameStyle={styles.signatureText}
            renderTime={(timeProps) => (
              <Time
                {...timeProps}
                timeTextStyle={{
                  left: styles.leftTimeText,
                  right: styles.rightTimeText,
                }}
                containerStyle={{
                  left: styles.leftTimeContainer,
                  right: styles.rightTimeContainer,
                }}
              />
            )}
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
};

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
  signatureText: {},
  leftTimeContainer: {},
  leftTimeText: {},
  rightTimeContainer: {},
  rightTimeText: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

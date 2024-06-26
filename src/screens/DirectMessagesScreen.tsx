import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Bubble,
  Composer,
  GiftedChat,
  IMessage,
  InputToolbar,
  MessageImage,
  MessageImageProps,
  MessageText,
  MessageTextProps,
  Time,
} from 'react-native-gifted-chat';
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Keyboard,
} from 'react-native';
import {
  useInfinitePrivatePosts,
  useCreatePrivatePostMutation,
  postToMessage,
  useCreatePrivatePostAttachmentMutation,
  CreateAttachmentResponse,
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
import { Linking, Platform, StyleProp, TextStyle, View } from 'react-native';
import { ParseShape } from 'react-native-parsed-text';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../hooks/useTheme';
import type { launchImageLibrary } from 'react-native-image-picker';
import memoize from 'lodash/memoize';

let launchImagePicker: typeof launchImageLibrary;

try {
  launchImagePicker = require('react-native-image-picker').launchImageLibrary;
} catch {
  console.log(
    'Add react-native-image-picker to support messaging image uploads.',
  );
}

const MAX_IMAGE_UPLOADS_PER_MESSAGE = 10;
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
  const { Send: SendIcon, Image: ImageIcon, X: XIcon } = useIcons();
  const textLength = useRef<number>(0);
  const { colors } = useTheme();
  const { mutateAsync: markAsRead } = useMarkAsRead();
  const { data: conversations } = useInfiniteConversations();
  const { data: userData, isLoading: userLoading } = useUser();
  const tabsHeight = useBottomTabBarHeight();
  const otherProfiles = users.filter((user) => user.id !== userData?.id);
  const [pendingImages, setPendingImages] = React.useState<
    (
      | (CreateAttachmentResponse & { loading?: false })
      | {
          loading: true;
          uploadConfig: { fileLocation: { permanentUrl: string } };
        }
    )[]
  >([]);
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(
    Keyboard.isVisible(),
  );

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => setIsKeyboardOpen(true));
    Keyboard.addListener('keyboardWillHide', () => setIsKeyboardOpen(false));
  }, []);

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
  const { mutateAsync: createAttachment } =
    useCreatePrivatePostAttachmentMutation();

  const RemoveImageIcon = useCallback(
    () => <XIcon style={styles.removePendingImageButtonIcon} />,
    [XIcon, styles.removePendingImageButtonIcon],
  );

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      Keyboard.dismiss();

      // Shouldn't happen but this makes sure we don't send empty attachments
      const removeLoadingImages = (
        item:
          | (CreateAttachmentResponse & { loading?: false })
          | {
              loading: true;
            },
      ): item is CreateAttachmentResponse => !item.loading;

      // In practice their won't be more than one message at a time
      await Promise.all(
        newMessages.map(async (m) => {
          const isLastMessage =
            newMessages.indexOf(m) === newMessages.length - 1;

          await mutateAsync({
            userIds: users.map((user) => user.id),
            post: {
              message: m.text,
              ...(isLastMessage
                ? {
                    attachmentsV2: pendingImages
                      .filter(removeLoadingImages)
                      .map((i) => ({
                        ...i.attachment,
                        url: i.uploadConfig.fileLocation.permanentUrl,
                      })),
                  }
                : {}),
            },
          });
        }),
      );
      setPendingImages([]);
    },
    [mutateAsync, users, pendingImages],
  );

  const canUploadImages = !!launchImagePicker;
  const addImageAttachment = useCallback(async () => {
    Keyboard.dismiss();

    const pickerResult = await launchImagePicker({
      mediaType: 'photo',
      selectionLimit: MAX_IMAGE_UPLOADS_PER_MESSAGE - pendingImages.length,
      quality: 0.5,
    });

    const assets = pickerResult?.assets?.filter((asset) => !!asset.uri);

    if (assets) {
      assets.map(async (asset) => {
        const loadingAsset = {
          loading: true as const,
          uploadConfig: {
            fileLocation: {
              permanentUrl: asset.uri as string,
            },
          },
        };

        setPendingImages((current) => current.concat(loadingAsset));

        let attachments: CreateAttachmentResponse[] = [];
        try {
          attachments = [
            await createAttachment({
              userIds: users.map((user) => user.id),
              asset,
            }),
          ];
        } catch (e) {
          console.log('Failed to upload image.', e);
        }

        setPendingImages((current) => {
          const index = current.indexOf(loadingAsset);

          current.splice(index, 1, ...attachments);

          return current.slice();
        });
      });
    }
  }, [createAttachment, users, pendingImages]);

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
        /* istanbul ignore next */
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
      messagesContainerStyle={[
        styles.messagesContainerStyle,
        isKeyboardOpen && { paddingBottom: 0 },
      ]}
      renderBubble={(props) => {
        return (
          <Bubble
            {...props}
            wrapperStyle={
              props.currentMessage?.text
                ? {
                    left: styles.leftMessageView,
                    right: styles.rightMessageView,
                  }
                : {
                    right: styles.messageImageBubble,
                    left: styles.messageImageBubble,
                  }
            }
            textStyle={{
              left: styles.leftText,
              right: styles.rightText,
            }}
            nextMessage={props.nextMessage}
            usernameStyle={styles.signatureText}
            renderTime={(timeProps) =>
              timeProps.currentMessage?.createdAt !==
                (timeProps as any).nextMessage?.createdAt &&
              props.currentMessage?.text && (
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
              )
            }
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
            accessoryStyle={{
              height: styles.pendingImagesContainer?.height,
              ...styles.accessoryContainer,
            }}
          />
        );
      }}
      renderMessageImage={renderCustomImage}
      renderMessageText={renderCustomText}
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
        const disabled =
          pendingImages.some((image) => image.loading) ||
          (textLength.current <= 0 && pendingImages.length <= 0);
        const iconColor = disabled
          ? styles.sendIconColor?.disabled
          : styles.sendIconColor?.enabled;

        return (
          <IconButton
            {...props}
            onPress={() =>
              !disabled &&
              props.onSend?.({ text: props.text?.trim() || '' }, true)
            }
            disabled={disabled}
            style={styles.sendButtonContainer}
            testID={`GC_SEND_TOUCHABLE${disabled ? '_DISABLED' : ''}`}
            iconColor={iconColor}
            icon={SendIcon}
          />
        );
      }}
      parsePatterns={messageTextParsers}
      renderActions={() =>
        canUploadImages && (
          <IconButton
            disabled={pendingImages.length >= MAX_IMAGE_UPLOADS_PER_MESSAGE}
            onPress={addImageAttachment}
            iconColor={
              pendingImages.length >= MAX_IMAGE_UPLOADS_PER_MESSAGE
                ? styles.uploadImageIconDisabled?.color
                : styles.uploadImageIcon?.color
            }
            icon={ImageIcon}
            testID="upload-image-button"
          />
        )
      }
      renderFooter={() =>
        // Add a footer to the bottom of the screen to account for the image preview
        !!pendingImages.length &&
        !isKeyboardOpen && (
          <View
            style={[
              { height: styles.pendingImagesContainer?.height },
              styles.footer,
            ]}
          />
        )
      }
      renderAccessory={
        pendingImages.length
          ? () => (
              <ScrollView
                style={styles.pendingImagesScrollView}
                contentContainerStyle={styles.pendingImagesContainer}
                horizontal
              >
                {pendingImages.map((image) => (
                  <View
                    testID="image-preview-container"
                    key={image.uploadConfig?.fileLocation.permanentUrl}
                    style={styles.pendingImagePreviewContainer}
                  >
                    <MessageImage
                      imageStyle={[
                        styles.previewImage,
                        image.loading && styles.previewImageLoading,
                      ]}
                      currentMessage={{
                        _id: `${image.uploadConfig?.fileLocation.permanentUrl}-message`,
                        createdAt: new Date(),
                        user: {
                          _id: userData.id,
                        },
                        text: '',
                        image: image.uploadConfig?.fileLocation.permanentUrl,
                      }}
                    />
                    {!image.loading && (
                      <IconButton
                        testID="remove-image-button"
                        icon={RemoveImageIcon}
                        onPress={() =>
                          setPendingImages((current) =>
                            current.filter(
                              (currentImage) => currentImage !== image,
                            ),
                          )
                        }
                        style={styles.removePendingImageButton}
                      />
                    )}
                    {image.loading && (
                      <ActivityIndicator
                        style={styles.previewImageLoadingIndicatorContainer}
                        color={colors.primarySource}
                      />
                    )}
                  </View>
                ))}
              </ScrollView>
            )
          : undefined
      }
    />
  );
};

const renderCustomText = memoize(
  (props: MessageTextProps<IMessage>) => <MessageText {...props} />,
  ({ currentMessage }) => currentMessage?._id,
);

const renderCustomImage = memoize(
  (props: MessageImageProps<IMessage>) => <CustomMessageImage {...props} />,
  ({ currentMessage }) => currentMessage?._id,
);

const CustomMessageImage = React.memo(
  (props: MessageImageProps<IMessage>) => {
    const { styles } = useStyles(defaultStyles);
    const [dimensions, setDimensions] = useState({});

    useEffect(() => {
      const image = props.currentMessage?.image;

      if (image) {
        Image.getSize(image, (width, height) => {
          const aspectRatio = width / height;
          const largerDimension = width > height ? 'width' : 'height';

          if (isFinite(aspectRatio)) {
            setDimensions({
              [largerDimension]: 'auto',
              aspectRatio,
            });
          }
        });
      }
    }, [props.currentMessage?.image]);

    return (
      <View style={{ position: 'relative' }}>
        <ActivityIndicator
          style={styles.messageImageLoadingIcon}
          color={styles.messageImageLoadingIcon?.color}
        />
        <MessageImage
          {...props}
          lightboxProps={{
            underlayColor: styles.messageImageLightbox?.backgroundColor,
            style: styles.messageImageLightbox,
          }}
          imageStyle={[
            dimensions,
            {
              maxWidth: Dimensions.get('screen').width * 0.65,
            },
            styles.messageImage,
          ]}
        />
      </View>
    );
  },
  (a, b) => a.currentMessage?.image === b.currentMessage?.image,
);

export const messageTextParsers = (
  linkStyle: StyleProp<TextStyle>,
  disabled = false,
): ParseShape[] => [
  {
    pattern: /!\[(.+)\]\((\S+)\)/,
    renderText: (_fullString: string, matches: string[]) => `<${matches[1]}>`,
  },
  {
    pattern: /\[(.+)\]\((\S+)\)/,
    style: linkStyle,
    renderText: (_fullString: string, matches: string[]) => matches[1],
    onPress: (url: string) => {
      const matches = url.match(/\[.+\]\((.+)\)/) || [];
      Linking.openURL(matches[1]);
    },
    disabled,
  },
  {
    type: 'url',
    style: linkStyle,
    onPress: (url: string) => Linking.openURL(url),
    disabled,
  },
  {
    type: 'phone',
    style: linkStyle,
    onPress: (url: string) => Linking.openURL(`tel:${url}`),
    disabled,
  },
  {
    type: 'email',
    style: linkStyle,
    onPress: (url: string) => Linking.openURL(`mailto:${url}`),
    disabled,
  },
  {
    pattern: /\*{3}(.+)\*{3}?/,
    style: { fontWeight: 'bold', fontStyle: 'italic' },
    renderText: (match: string) => match.slice(3, -3),
  },
  {
    pattern: /[*_]{2}(.+)[*_]{2}?/,
    style: { fontWeight: 'bold' },
    renderText: (match: string) => match.slice(2, -2),
  },
  {
    pattern: /[*_]{1}(.+)[*_]{1}?/,
    style: { fontStyle: 'italic' },
    renderText: (match: string) => match.slice(1, -1),
  },
  {
    pattern: /~{2}(.+)~{2}?/,
    style: { textDecorationLine: 'line-through' },
    renderText: (match: string) => match.slice(2, -2),
  },
];

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
    color: theme.colors.onSurfaceDisabled,
  },
  signatureText: {},
  leftTimeContainer: {},
  leftTimeText: {},
  rightTimeContainer: {},
  rightTimeText: {},
  uploadImageIcon: {
    color: theme.colors.onSurface,
  },
  uploadImageIconDisabled: {
    color: theme.colors.onSurfaceDisabled,
  },
  footer: {},
  accessoryContainer: {},
  pendingImagesScrollView: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  pendingImagesContainer: {
    height: 68,
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  pendingImagePreviewContainer: {
    position: 'relative',
    paddingTop: 16,
    paddingBottom: 8,
  },
  previewImage: {
    height: 43,
    width: 43,
    aspectRatio: 1,
    opacity: 1,
  },
  previewImageLoading: {
    opacity: 0.5,
  },
  removePendingImageButton: {
    position: 'absolute',
    right: -12,
    top: 2,
    backgroundColor: 'grey',
    borderRadius: 24,
    width: 24,
    height: 24,
    transform: [{ scale: 0.75 }],
  },
  removePendingImageButtonIcon: {
    height: 12,
    width: 12,
    color: 'white',
  },
  previewImageLoadingIndicatorContainer: {
    ...StyleSheet.absoluteFillObject,
    top: 8,
  },
  messageImageLoadingIcon: {
    ...StyleSheet.absoluteFillObject,
    color: theme.colors.onPrimaryContainer,
  },
  messageImageBubble: {
    backgroundColor: 'transparent',
  },
  messageImage: {
    margin: 0,
  },
  messageImageLightbox: {
    backgroundColor: 'transparent',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

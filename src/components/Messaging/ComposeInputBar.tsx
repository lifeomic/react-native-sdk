import { useCallback, useState } from 'react';
import { useCreatePrivatePostMutation } from '../../hooks/Circles/usePrivatePosts';
import { useIcons } from '../BrandConfigProvider';
import React from 'react';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';
import { createStyles } from '../../components/BrandConfigProvider';
import { ActivityIndicatorViewStyles } from '../ActivityIndicatorView';
import { IconButton } from 'react-native-paper';
import { InputToolbar } from 'react-native-gifted-chat/lib/InputToolbar';
import { Composer } from 'react-native-gifted-chat/lib/Composer';
import { useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigators';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserProfile } from '../../hooks/useAppConfig';
import { useUser } from '../../hooks/useUser';
import { uniq } from 'lodash';

type Props = {
  users: UserProfile[];
};

export const ComposeInputBar = ({ users }: Props) => {
  const { Send: SendIcon } = useIcons();
  const [messageText, setMessageText] = useState<string>('');
  const { styles } = useStyles(defaultStyles);
  const { mutateAsync } = useCreatePrivatePostMutation();
  const navigation =
    useNavigation<
      StackNavigationProp<HomeStackParamList, 'Home/ComposeMessage'>
    >();
  const { data } = useUser();

  const onSend = useCallback(() => {
    const userIds = users.map((user) => user.id);
    const uniqueIds = uniq([...userIds, data!.id]).sort();
    const sendMessageAndNavigate = async () => {
      const result = await mutateAsync({
        userIds: uniqueIds,
        post: { message: messageText },
      });
      navigation.replace('Home/DirectMessage', {
        users,
        conversationId: result.createPrivatePost.conversationId,
      });
    };

    sendMessageAndNavigate();
  }, [data, messageText, mutateAsync, navigation, users]);

  const SendButton = useCallback(() => {
    const disabled =
      messageText.length === 0 || users.length === 0 || !data?.id;
    const iconColor = disabled
      ? styles.sendIconColor?.disabled
      : styles.sendIconColor?.enabled;

    return (
      <IconButton
        // eslint-disable-next-line react/no-unstable-nested-components
        icon={() => <SendIcon color={iconColor} />}
        onPress={onSend}
        disabled={disabled}
      />
    );
  }, [
    SendIcon,
    data?.id,
    messageText.length,
    onSend,
    styles.sendIconColor?.disabled,
    styles.sendIconColor?.enabled,
    users.length,
  ]);

  return (
    <InputToolbar
      containerStyle={styles.inputToolbarContainer}
      renderComposer={(props) => {
        return (
          <Composer
            {...props}
            onTextChanged={(text) => setMessageText(text)}
            text={messageText}
            textInputStyle={styles.inputTextStyle}
            placeholderTextColor={styles.placeholderText?.color?.toString()}
          />
        );
      }}
      renderSend={() => <SendButton />}
    />
  );
};

const defaultStyles = createStyles('ComposeInputBar', (theme) => ({
  activityIndicator: {
    view: {
      backgroundColor: theme.colors.elevation.level1,
    },
  } as ActivityIndicatorViewStyles,
  inputToolbarContainer: {
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 16,
  },
  inputTextStyle: {},
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

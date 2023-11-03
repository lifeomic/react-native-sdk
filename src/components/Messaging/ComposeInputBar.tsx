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
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { uniq } from 'lodash';
import { User } from '../../types';
import type { ComposeScreenParamTypes } from '../../screens/ComposeMessageScreen';
import { toRouteMap } from '../../screens/utils/stack-helpers';

type Props<ParamList extends ParamListBase> = {
  users: User[];
  routeMapIn: ComposeScreenParamTypes<ParamList>['RouteMap'];
};

type NavigationProp<ParamList extends ParamListBase> =
  ComposeScreenParamTypes<ParamList>['ComponentProps']['navigation'];

export function ComposeInputBar<ParamList extends ParamListBase>({
  users,
  routeMapIn,
}: Props<ParamList>) {
  const routeMap = toRouteMap(routeMapIn);
  const { Send: SendIcon } = useIcons();
  const [messageText, setMessageText] = useState<string>('');
  const { styles } = useStyles(defaultStyles);
  const { mutateAsync } = useCreatePrivatePostMutation();
  const navigation = useNavigation<NavigationProp<ParamList>>();
  const { data } = useUser();

  const onSend = useCallback(() => {
    const userIds = users.map((user) => user.id);
    const uniqueIds = uniq([...userIds, data!.id]).sort();
    const sendMessageAndNavigate = async () => {
      const result = await mutateAsync({
        userIds: uniqueIds,
        post: { message: messageText },
      });
      navigation.replace(routeMap.DirectMessageScreen, {
        users,
        conversationId: result.createPrivatePost.conversationId,
      });
    };

    sendMessageAndNavigate();
  }, [
    data,
    messageText,
    mutateAsync,
    navigation,
    users,
    routeMap.DirectMessageScreen,
  ]);

  const SendButton = useCallback(() => {
    const disabled =
      messageText.length === 0 || users.length === 0 || !data?.id;
    const iconColor = disabled
      ? styles.sendIconColor?.disabled
      : styles.sendIconColor?.enabled;

    return (
      <IconButton
        icon={SendIcon}
        iconColor={iconColor}
        onPress={onSend}
        disabled={disabled}
        testID={'send-button'}
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
            textInputStyle={styles.inputText}
            placeholderTextColor={styles.placeholderText?.color?.toString()}
          />
        );
      }}
      renderSend={() => <SendButton />}
    />
  );
}

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
  inputText: {},
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

import { useCallback, useState } from 'react';
import { useCreatePrivatePostMutation } from '../../hooks/Circles/usePrivatePosts';
import { useIcons } from '../BrandConfigProvider';
import React from 'react';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';
import { createStyles } from '../../components/BrandConfigProvider';
import { ActivityIndicatorViewStyles } from '../ActivityIndicatorView';
import { FAB } from 'react-native-paper';
import { InputToolbar } from 'react-native-gifted-chat/lib/InputToolbar';
import { Composer } from 'react-native-gifted-chat/lib/Composer';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { useUser } from '../../hooks/useUser';
import { uniq } from 'lodash';
import type { ComposeScreenParamTypes } from '../../screens/ComposeMessageScreen';
import { toRouteMap } from '../../screens/utils/stack-helpers';
import { UserProfile } from '../../hooks/useMessagingProfiles';

type Props<ParamList extends ParamListBase> = {
  users: UserProfile[];
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
      <FAB
        icon={SendIcon}
        size="small"
        color={iconColor}
        onPress={onSend}
        disabled={disabled}
        testID={'send-button'}
        style={styles.sendButton}
      />
    );
  }, [
    SendIcon,
    data?.id,
    messageText.length,
    onSend,
    styles.sendButton,
    styles.sendIconColor?.disabled,
    styles.sendIconColor?.enabled,
    users.length,
  ]);

  return (
    <InputToolbar
      containerStyle={styles.inputToolbarContainer}
      primaryStyle={styles.inputToolbarPrimaryView}
      renderSend={SendButton}
      renderComposer={(props) => {
        return (
          <Composer
            {...props}
            onTextChanged={(text) => setMessageText(text)}
            text={messageText}
            textInputStyle={styles.inputText}
            multiline={true}
            placeholderTextColor={styles.placeholderText?.color?.toString()}
          />
        );
      }}
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
    marginHorizontal: 16,
    flex: 1,
    position: 'relative',
    alignContent: 'flex-start',
    minHeight: 150,
  },
  inputToolbarPrimaryView: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inputText: {
    textAlignVertical: 'top',
    flex: 1,
  },
  sendIconColor: {
    enabled: theme.colors.primary,
    disabled: theme.colors.primaryContainer,
  },
  placeholderText: {
    color: theme.colors.surfaceDisabled,
  },
  sendButton: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

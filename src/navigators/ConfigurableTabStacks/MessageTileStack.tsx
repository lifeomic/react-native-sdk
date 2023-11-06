import React from 'react';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { AppNavHeader } from '../../components/AppNavHeader';
import { navigationScreenListeners } from '../../hooks/useLogoHeaderOptions';
import { useDeveloperConfig } from '../../hooks/useDeveloperConfig';
import {
  createMessageScreen,
  MessageTileParams,
} from '../../screens/MessageScreen';
import {
  DirectMessageParams,
  DirectMessagesScreen,
} from '../../screens/DirectMessagesScreen';
import { useAppConfig } from '../../hooks';
import {
  ComposeMessageParams,
  createComposeMessageScreen,
} from '../../screens/ComposeMessageScreen';

type MessageTileStackParamList = {
  'MessageTileStack/Messages': MessageTileParams;
  'MessageTileStack/DirectMessage': DirectMessageParams;
  'MessageTileStack/ComposeMessage': ComposeMessageParams;
};

const Stack = createNativeStackNavigator<MessageTileStackParamList>();
const MessageScreen = createMessageScreen<MessageTileStackParamList>({
  DirectMessageScreen: 'MessageTileStack/DirectMessage',
  ComposeMessageScreen: 'MessageTileStack/ComposeMessage',
});
const ComposeMessageScreen =
  createComposeMessageScreen<MessageTileStackParamList>({
    DirectMessageScreen: 'MessageTileStack/DirectMessage',
  });

export function MessageTileStack() {
  const { logoHeaderConfig } = useDeveloperConfig();
  const { params } = useRoute();
  const queryClient = useQueryClient();
  const { data: appConfig } = useAppConfig();

  const tileId = appConfig?.homeTab?.messageTiles?.[0]?.id;

  return (
    <Stack.Navigator
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen
        name="MessageTileStack/Messages"
        initialParams={{ ...params, tileId }}
        component={MessageScreen}
      />
      <Stack.Screen
        name="MessageTileStack/DirectMessage"
        component={DirectMessagesScreen}
        listeners={() => ({
          beforeRemove: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          },
        })}
      />
      <Stack.Screen
        name="MessageTileStack/ComposeMessage"
        component={ComposeMessageScreen}
        options={{ presentation: 'containedModal' }}
      />
    </Stack.Navigator>
  );
}

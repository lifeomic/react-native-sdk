import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AppTileScreen } from '../screens/AppTileScreen';
import { CustomAppTileScreen } from '../screens/CustomAppTileScreen';
import { TrackTileTrackerScreen } from '../screens/TrackTileTrackerScreen';
import { AppNavHeader } from '../components/AppNavHeader';
import { t } from '../../lib/i18n';
import TrackTileSettingsScreen from '../screens/TrackTileSettingsScreen';
import TrackTileAdvancedDetailsScreen from '../screens/TrackTileAdvancedDetailsScreen';
import TrackTileAdvancedEditorScreen from '../screens/TrackTileAdvancedEditorScreen';
import { AuthedAppTileScreen } from '../screens/AuthedAppTileScreen';
import { HomeStackParamList } from './types';
import { CircleDiscussionScreen } from '../screens/CircleDiscussionScreen';
import { useDeveloperConfig } from '../hooks';
import { MyDataScreen } from '../screens/MyDataScreen';
import { YoutubePlayerScreen } from '../screens/YoutubePlayerScreen';
import { navigationScreenListeners } from '../hooks/useLogoHeaderOptions';
import { DirectMessagesScreen } from '../screens/DirectMessagesScreen';
import { createMessageScreen } from '../screens/MessageScreen';
import { useInvalidateTodayCountCache } from '../hooks/todayTile/useTodayTasks';
import { useQueryClient } from '@tanstack/react-query';
import { createComposeMessageScreen } from '../screens/ComposeMessageScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const MessageScreen = createMessageScreen<HomeStackParamList>({
  DirectMessageScreen: 'Home/DirectMessage',
  ComposeMessageScreen: 'Home/ComposeMessage',
});
const ComposeMessageScreen = createComposeMessageScreen<HomeStackParamList>({
  DirectMessageScreen: 'Home/DirectMessage',
});

export function HomeStack() {
  const { getAdditionalHomeScreens, logoHeaderConfig, CustomHomeScreen } =
    useDeveloperConfig();
  const invalidateTodayTasksCache = useInvalidateTodayCountCache();
  const queryClient = useQueryClient();

  return (
    <Stack.Navigator
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen name="Home" component={CustomHomeScreen || HomeScreen} />
      <Stack.Screen name="Home/AppTile" component={AppTileScreen} />
      <Stack.Screen
        name="Home/AuthedAppTile"
        component={AuthedAppTileScreen}
        listeners={(props) => ({
          beforeRemove: () => {
            if (props.route.params.refreshTodayCountOnRemove) {
              invalidateTodayTasksCache();
            }
          },
        })}
      />
      <Stack.Screen name="Home/CustomAppTile" component={CustomAppTileScreen} />
      <Stack.Screen name="Home/TrackTile" component={TrackTileTrackerScreen} />
      <Stack.Screen
        name="Home/Circle/Discussion"
        component={CircleDiscussionScreen}
      />
      <Stack.Screen
        name="Home/TrackTileSettings"
        component={TrackTileSettingsScreen}
        options={{ title: t('Track-It Items') }}
      />
      <Stack.Screen
        name="Home/AdvancedTrackerDetails"
        component={TrackTileAdvancedDetailsScreen}
      />
      <Stack.Screen
        name="Home/AdvancedTrackerEditor"
        component={TrackTileAdvancedEditorScreen}
      />
      <Stack.Screen
        name="Home/MyData"
        component={MyDataScreen}
        options={{ title: t('My Data') }}
      />
      <Stack.Screen
        name="Home/YoutubePlayer"
        component={YoutubePlayerScreen}
        options={({ route }) => ({ title: route.params.videoName || ' ' })}
      />
      <Stack.Screen name="Home/Messages" component={MessageScreen} />
      <Stack.Screen
        name="Home/ComposeMessage"
        component={ComposeMessageScreen}
        options={{ presentation: 'containedModal' }}
      />
      <Stack.Screen
        name="Home/DirectMessage"
        component={DirectMessagesScreen}
        listeners={() => ({
          beforeRemove: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          },
        })}
      />
      {getAdditionalHomeScreens?.(Stack)}
    </Stack.Navigator>
  );
}

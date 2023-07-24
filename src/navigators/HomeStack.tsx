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

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  const { getAdditionalHomeScreens } = useDeveloperConfig();

  return (
    <Stack.Navigator screenOptions={{ header: AppNavHeader }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Home/AppTile" component={AppTileScreen} />
      <Stack.Screen name="Home/AuthedAppTile" component={AuthedAppTileScreen} />
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
      {getAdditionalHomeScreens?.(Stack)}
    </Stack.Navigator>
  );
}

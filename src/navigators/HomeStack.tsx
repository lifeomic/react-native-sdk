import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AppTile } from '../hooks/useAppConfig';
import { AppTileScreen } from '../screens/AppTileScreen';
import { CustomAppTileScreen } from '../screens/CustomAppTileScreen';
import { TrackTileTrackerScreen } from '../screens/TrackTileTrackerScreen';
import { AppNavHeader } from '../components/AppNavHeader';
import { TrackerValuesContext } from '../components/TrackTile/main';
import TrackTileSettingsScreen from '../screens/TrackTileSettingsScreen';
import { t } from '../../lib/i18n';

export type HomeStackParamList = {
  Home: undefined;
  'Home/AppTile': { appTile: AppTile };
  'Home/CustomAppTile': { appTile: AppTile };
  'Home/TrackTile': { tracker: any; valuesContext: any };
  'Home/TrackTileSettings': {
    valuesContext: TrackerValuesContext;
  };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: AppNavHeader,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Home/AppTile" component={AppTileScreen} />
      <Stack.Screen name="Home/CustomAppTile" component={CustomAppTileScreen} />
      <Stack.Screen name="Home/TrackTile" component={TrackTileTrackerScreen} />
      <Stack.Screen
        name="Home/TrackTileSettings"
        component={TrackTileSettingsScreen}
        options={{ title: t('Track-It Items') }}
      />
    </Stack.Navigator>
  );
}

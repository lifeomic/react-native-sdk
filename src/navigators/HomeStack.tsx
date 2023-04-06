import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AppTile } from '../hooks/useAppConfig';
import { AppTileScreen } from '../screens/AppTileScreen';
import { CustomAppTileScreen } from '../screens/CustomAppTileScreen';
import { AppNavHeader } from '../components/AppNavHeader';

export type HomeStackParamList = {
  Home: undefined;
  'tiles/AppTile': { appTile: AppTile };
  'tiles/CustomAppTile': { appTile: AppTile };
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
      <Stack.Screen name="tiles/AppTile" component={AppTileScreen} />
      <Stack.Screen
        name="tiles/CustomAppTile"
        component={CustomAppTileScreen}
      />
    </Stack.Navigator>
  );
}
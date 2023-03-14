import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AppTile } from '../hooks/useAppConfig';
import { AppTileScreen } from '../screens/AppTileScreen';
import { AppNavHeader } from '../components/AppNavHeader';

export type HomeStackParamList = {
  Home: undefined;
  'tiles/AppTile': { appTile: AppTile };
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
    </Stack.Navigator>
  );
}

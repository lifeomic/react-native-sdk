import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AppTile } from '../hooks/useAppConfig';
import { AppTileScreen } from '../screens/AppTileScreen';

export type HomeStackParamList = {
  Home: undefined;
  'tiles/AppTile': { appTile: AppTile };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: '',
        title: '',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="tiles/AppTile" component={AppTileScreen} />
    </Stack.Navigator>
  );
}

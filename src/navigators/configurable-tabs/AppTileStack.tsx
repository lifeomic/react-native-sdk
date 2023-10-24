import React from 'react';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../../components/AppNavHeader';
import { AppTileParams, AppTileScreen } from '../../screens/AppTileScreen';
import { navigationScreenListeners } from '../../hooks/useLogoHeaderOptions';
import { useDeveloperConfig } from '../../hooks/useDeveloperConfig';

type AppTileStackParamList = {
  AppTile: AppTileParams;
};

const Stack = createNativeStackNavigator<AppTileStackParamList>();

export function AppTileStack() {
  const { logoHeaderConfig } = useDeveloperConfig();
  const { params } = useRoute();
  return (
    <Stack.Navigator
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen
        initialParams={{ ...params, tabMode: true }}
        name="AppTile"
        component={AppTileScreen}
      />
    </Stack.Navigator>
  );
}

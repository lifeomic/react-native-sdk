import React from 'react';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../../components/AppNavHeader';
import { AppTileParams, AppTileScreen } from '../../screens/AppTileScreen';
import { navigationScreenListeners } from '../../hooks/useLogoHeaderOptions';
import { useDeveloperConfig } from '../../hooks/useDeveloperConfig';
import {
  AuthedAppTileParams,
  AuthedAppTileScreen,
} from '../../screens/AuthedAppTileScreen';

type AppTileStackParamList = {
  AppTile: AppTileParams;
  AuthedAppTile: AuthedAppTileParams;
};

const Stack = createNativeStackNavigator<AppTileStackParamList>();

export function AppTileStack() {
  const { logoHeaderConfig } = useDeveloperConfig();
  const { params } = useRoute();

  const initialRouteName = (params as any)?.appTile?.clientId
    ? 'AuthedAppTile'
    : 'AppTile';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen
        initialParams={{ ...params, tabMode: true }}
        name="AppTile"
        component={AppTileScreen}
      />
      <Stack.Screen
        initialParams={{ ...params, tabMode: true }}
        name="AuthedAppTile"
        component={AuthedAppTileScreen}
      />
    </Stack.Navigator>
  );
}

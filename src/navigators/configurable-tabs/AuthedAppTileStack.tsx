import React from 'react';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../../components/AppNavHeader';
import { navigationScreenListeners } from '../../hooks/useLogoHeaderOptions';
import { useDeveloperConfig } from '../../hooks/useDeveloperConfig';
import {
  AuthedAppTileParams,
  AuthedAppTileScreen,
} from '../../screens/AuthedAppTileScreen';

type AuthedAppTileStackParamList = {
  AuthedAppTile: AuthedAppTileParams;
};

const Stack = createNativeStackNavigator<AuthedAppTileStackParamList>();

export function AuthedAppTileStack() {
  const { logoHeaderConfig } = useDeveloperConfig();
  const { params } = useRoute();
  return (
    <Stack.Navigator
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen
        initialParams={{ ...params, tabMode: true }}
        name="AuthedAppTile"
        component={AuthedAppTileScreen}
      />
    </Stack.Navigator>
  );
}

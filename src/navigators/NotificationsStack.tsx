import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../components/AppNavHeader';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationsStackParamList } from './types';
import { navigationScreenListeners } from '../hooks/useLogoHeaderOptions';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStack() {
  const { logoHeaderConfig } = useDeveloperConfig();
  return (
    <Stack.Navigator
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

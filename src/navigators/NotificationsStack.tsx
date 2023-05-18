import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../components/AppNavHeader';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationsStackParamList } from './types';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStack() {
  const { AppNavHeader: CustomAppNavHeader } = useDeveloperConfig();
  const header = CustomAppNavHeader || AppNavHeader;

  return (
    <Stack.Navigator screenOptions={{ header }}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

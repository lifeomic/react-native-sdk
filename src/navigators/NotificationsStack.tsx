import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../components/AppNavHeader';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationsStackParamList } from './types';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export function NotificationsStack() {
  return (
    <Stack.Navigator screenOptions={{ header: AppNavHeader }}>
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

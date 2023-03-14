import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AccountSelectionScreen } from '../screens/AccountSelectionScreen';
import { AppNavHeader } from '../components/AppNavHeader';

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  AccountSelection: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: AppNavHeader,
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('profile-screen-title', 'Profile'),
        }}
      />
      <Stack.Screen
        name="AccountSelection"
        component={AccountSelectionScreen}
        options={{ title: t('Account') }}
      />
    </Stack.Navigator>
  );
}

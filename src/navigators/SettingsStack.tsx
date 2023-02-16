import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { t } from 'i18next';
import { AccountSelectionScreen } from 'src/screens/AccountSelectionScreen';

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  AccountSelection: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
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

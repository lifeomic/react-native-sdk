import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AccountSelectionScreen } from '../screens/AccountSelectionScreen';
import { AppNavHeader } from '../components/AppNavHeader';
import WearablesScreen from '../screens/WearablesScreen';
import { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ header: AppNavHeader }}>
      <Stack.Screen
        name="Settings/Profile"
        component={ProfileScreen}
        options={{
          title: t('profile-screen-title', 'Profile'),
        }}
      />
      <Stack.Screen
        name="Settings/AccountSelection"
        component={AccountSelectionScreen}
        options={{ title: t('account', 'Account') }}
      />
      <Stack.Screen
        name="Settings/Wearables"
        component={WearablesScreen}
        options={{ title: t('sync-data', 'Sync Data') }}
      />
    </Stack.Navigator>
  );
}

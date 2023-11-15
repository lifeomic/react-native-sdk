import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AppNavHeader } from '../components/AppNavHeader';
import WearablesScreen from '../screens/WearablesScreen';
import { SettingsStackParamList } from './types';
import { navigationScreenListeners } from '../hooks/useLogoHeaderOptions';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  const { logoHeaderConfig } = useDeveloperConfig();
  return (
    <Stack.Navigator
      screenOptions={{ header: AppNavHeader }}
      screenListeners={navigationScreenListeners(logoHeaderConfig)}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="Settings/Profile"
        component={ProfileScreen}
        options={{
          title: t('profile-screen-title', 'Profile'),
        }}
      />
      <Stack.Screen
        name="Settings/Wearables"
        component={WearablesScreen}
        options={{ title: t('sync-data', 'Sync Data') }}
      />
    </Stack.Navigator>
  );
}

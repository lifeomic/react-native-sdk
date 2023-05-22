import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AccountSelectionScreen } from '../screens/AccountSelectionScreen';
import { AppNavHeader } from '../components/AppNavHeader';
import WearablesScreen from '../screens/WearablesScreen';
import { SettingsStackParamList } from './types';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  const { AppNavHeader: CustomAppNavHeader } = useDeveloperConfig();
  const header = CustomAppNavHeader || AppNavHeader;

  return (
    <Stack.Navigator screenOptions={{ header }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
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

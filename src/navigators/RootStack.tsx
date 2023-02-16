import React from 'react';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { useAuth } from '../hooks';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInProviders } from '../common/LoggedInProviders';
import { SettingsStack } from './SettingsStack';
import { LoginScreen } from '../screens/LoginScreen';

export type NotLoggedInRootParamList = {
  'screens/LoginScreen': { username?: string };
};

export function RootStack() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (isLoggedIn) {
    return (
      <LoggedInProviders>
        <SettingsStack />
      </LoggedInProviders>
    );
  }

  const Stack = createNativeStackNavigator<NotLoggedInRootParamList>();
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen name="screens/LoginScreen" component={LoginScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

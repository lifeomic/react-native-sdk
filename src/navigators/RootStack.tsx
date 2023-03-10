import React from 'react';
import { t } from 'i18next';
import { NavigatorScreenParams } from '@react-navigation/native';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { useAuth } from '../hooks';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInProviders } from '../common/LoggedInProviders';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator, TabParamList } from './TabNavigator';

export type LoggedInRootParamList = {
  app: NavigatorScreenParams<TabParamList> | undefined;
};

export type NotLoggedInRootParamList = {
  'screens/LoginScreen': { username?: string };
};

export function RootStack() {
  const { isLoggedIn, loading } = useAuth();

  if (!isLoggedIn && loading) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (isLoggedIn) {
    const Stack = createNativeStackNavigator<LoggedInRootParamList>();
    return (
      <LoggedInProviders>
        <Stack.Navigator>
          <Stack.Screen
            name="app"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
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

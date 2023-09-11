import React from 'react';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { useAuth } from '../hooks';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInProviders } from '../common/LoggedInProviders';
import { LoginScreen } from '../screens/LoginScreen';
import { NotLoggedInRootParamList } from './types';
import { LoggedInStack } from './LoggedInStack';

export function RootStack() {
  const { isLoggedIn, loading: loadingAuth } = useAuth();
  if (!isLoggedIn && loadingAuth) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (isLoggedIn) {
    return (
      <LoggedInProviders>
        <LoggedInStack />
      </LoggedInProviders>
    );
  }

  const Stack = createNativeStackNavigator<NotLoggedInRootParamList>();
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen
          name="screens/LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

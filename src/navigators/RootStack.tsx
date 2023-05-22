import React from 'react';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { useAuth, useConsent } from '../hooks';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInProviders } from '../common/LoggedInProviders';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { LoggedInRootParamList, NotLoggedInRootParamList } from './types';
import { ConsentScreen } from '../screens/ConsentScreen';
import { CircleThreadScreen } from '../screens/CircleThreadScreen';

export function RootStack() {
  const { isLoggedIn, loading: loadingAuth } = useAuth();
  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen } = useShouldRenderConsentScreen();

  if (!isLoggedIn && loadingAuth) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (isLoggedIn) {
    const Stack = createNativeStackNavigator<LoggedInRootParamList>();
    const initialRouteName = shouldRenderConsentScreen
      ? 'screens/ConsentScreen'
      : 'app';

    return (
      <LoggedInProviders>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen
            name="app"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="screens/ConsentScreen"
            component={ConsentScreen}
            options={{
              presentation: 'fullScreenModal',
              title: t('consent', 'Consent'),
            }}
          />
          <Stack.Screen name="Circle/Thread" component={CircleThreadScreen} />
        </Stack.Navigator>
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

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
import { HomeStack } from './HomeStack';
import { SettingsStack } from './SettingsStack';

export function RootStack() {
  const { isLoggedIn, loading: loadingAuth } = useAuth();
  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen, isLoading: loadingConsents } =
    useShouldRenderConsentScreen();

  if (!isLoggedIn && loadingAuth) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (isLoggedIn) {
    if (loadingConsents) {
      return (
        <ActivityIndicatorView
          message={t('root-stack-waiting-for-consent', 'Waiting for consent')}
        />
      );
    }

    const Stack = createNativeStackNavigator<LoggedInRootParamList>();
    const initialRouteName = shouldRenderConsentScreen
      ? 'screens/ConsentScreen'
      : 'LandingTabs';

    return (
      <LoggedInProviders>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          id={'LoggedInStack'}
        >
          <Stack.Screen
            name="LandingTabs"
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
          <Stack.Screen
            name="HomeScreens"
            component={HomeStack}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SettingsScreens"
            component={SettingsStack}
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
        <Stack.Screen
          name="screens/LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

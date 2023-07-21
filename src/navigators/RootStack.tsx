import React from 'react';
import { t } from 'i18next';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import {
  useActiveAccount,
  useActiveProject,
  useAuth,
  useConsent,
  usePendingInvite,
} from '../hooks';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInProviders } from '../common/LoggedInProviders';
import { LoginScreen } from '../screens/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { LoggedInRootParamList, NotLoggedInRootParamList } from './types';
import { ConsentScreen } from '../screens/ConsentScreen';
import { CircleThreadScreen } from '../screens/CircleThreadScreen';
import { InviteRequiredScreen } from '../screens/InviteRequiredScreen';

export function RootStack() {
  const { isLoggedIn, loading: loadingAuth } = useAuth();
  const {
    account,
    isLoading: isLoadingAccount,
    isFetched: isFetchedAccount,
  } = useActiveAccount();
  const {
    activeProject,
    isLoading: isLoadingProject,
    isFetched: isFetchedProject,
  } = useActiveProject();
  const { inviteParams } = usePendingInvite();

  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen, isLoading: loadingConsents } =
    useShouldRenderConsentScreen();

  const loadingProject = !isFetchedProject || isLoadingProject;
  const loadingAccount = !isFetchedAccount || isLoadingAccount;
  const loadingAccountOrProject = loadingAccount || loadingProject;

  if (!isLoggedIn && loadingAuth) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-waiting-for-auth', 'Waiting for authorization')}
      />
    );
  }

  if (isLoggedIn) {
    const Stack = createNativeStackNavigator<LoggedInRootParamList>();
    const hasAccountAndProject = !!(activeProject?.id && account?.id);

    if (loadingAccountOrProject) {
      return (
        <ActivityIndicatorView
          message={t(
            'root-stack-waiting-for-account-and-project',
            'Loading account',
          )}
        />
      );
    }

    if (hasAccountAndProject && loadingConsents) {
      return (
        <ActivityIndicatorView
          message={t('root-stack-waiting-for-consents', 'Loading consents')}
        />
      );
    }

    if (inviteParams?.inviteId) {
      return (
        <ActivityIndicatorView
          message={t('root-stack-waiting-for-consents', 'Accepting invitation')}
        />
      );
    }

    const initialRoute = !hasAccountAndProject
      ? 'InviteRequired'
      : shouldRenderConsentScreen
      ? 'screens/ConsentScreen'
      : 'app';

    return (
      <LoggedInProviders>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="InviteRequired"
            component={InviteRequiredScreen}
            options={{
              presentation: 'fullScreenModal',
              title: t('invite-required', 'Invitation Required'),
            }}
          />
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

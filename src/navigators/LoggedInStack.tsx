import React from 'react';
import { TabNavigator } from './TabNavigator';
import { ConsentScreen } from '../screens/ConsentScreen';
import { CircleThreadScreen } from '../screens/CircleThreadScreen';
import { InviteRequiredScreen } from '../screens/InviteRequiredScreen';
import { OnboardingCourseScreen } from '../screens/OnboardingCourseScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInRootParamList } from './types';
import { useConsent } from '../hooks/useConsent';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useActiveProject } from '../hooks/useActiveProject';
import { useOnboardingCourse } from '../hooks/useOnboardingCourse';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { t } from 'i18next';
import { usePendingInvite } from '../hooks/usePendingInvite';
import { useSetUserProfileEffect } from '../hooks/useSetUserProfileEffect';

export function LoggedInStack() {
  const Stack = createNativeStackNavigator<LoggedInRootParamList>();
  const { inviteParams } = usePendingInvite();
  useSetUserProfileEffect();
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
  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen, isLoading: loadingConsents } =
    useShouldRenderConsentScreen();
  const {
    shouldLaunchOnboardingCourse,
    isLoading: onboardingCourseIsLoading,
    isFetched: onboardingCourseIsFetched,
  } = useOnboardingCourse();

  const loadingProject = !isFetchedProject || isLoadingProject;
  const loadingAccount = !isFetchedAccount || isLoadingAccount;
  const hasAccount = !loadingAccount && !!account?.id;
  const loadingAccountOrProject =
    loadingAccount || (hasAccount && loadingProject);
  const loadingOnboardingCourse =
    !onboardingCourseIsFetched || onboardingCourseIsLoading;

  const hasAccountAndProject = !!(activeProject?.id && account?.id);
  const initialRoute = !hasAccountAndProject
    ? 'InviteRequired'
    : shouldRenderConsentScreen
    ? 'screens/ConsentScreen'
    : shouldLaunchOnboardingCourse
    ? 'screens/OnboardingCourseScreen'
    : 'app';

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

  if (hasAccountAndProject && loadingOnboardingCourse) {
    return (
      <ActivityIndicatorView
        message={t(
          'root-stack-waiting-for-app-config',
          'Loading onboarding course data',
        )}
      />
    );
  }

  if (inviteParams?.inviteId) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-accepting-invitation', 'Accepting invitation')}
      />
    );
  }

  return (
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
      <Stack.Screen
        name="screens/OnboardingCourseScreen"
        component={OnboardingCourseScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen name="Circle/Thread" component={CircleThreadScreen} />
    </Stack.Navigator>
  );
}

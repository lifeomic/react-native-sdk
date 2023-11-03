import React, { useCallback, useEffect, useState } from 'react';
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
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { useJoinCircles } from '../hooks/Circles/useJoinCircles';
import { useProfilesForAllTiles } from '../hooks/useMessagingProfiles';

export function LoggedInStack() {
  const Stack = createNativeStackNavigator<LoggedInRootParamList>();
  const { inviteParams } = usePendingInvite();
  useSetUserProfileEffect();
  // Fetch profiles early but don't wait for them
  useProfilesForAllTiles();
  const {
    account,
    isLoading: isLoadingAccount,
    isFetched: isFetchedAccount,
  } = useActiveAccount();
  const {
    activeProject,
    activeSubjectId,
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
  const { isInitialLoading: loadingJoinCircles } = useJoinCircles();
  const { onAppSessionStart } = useDeveloperConfig();
  const [shouldWaitForOnAppStart, setShouldWaitForOnAppStart] = useState(
    !!onAppSessionStart,
  );

  const loadingProject = !isFetchedProject || isLoadingProject;
  const loadingAccount = !isFetchedAccount || isLoadingAccount;
  const hasAccount = !loadingAccount && !!account?.id;
  const loadingAccountOrProject =
    loadingAccount || (hasAccount && loadingProject);
  const loadingOnboardingCourse =
    !onboardingCourseIsFetched || onboardingCourseIsLoading;
  const hasAccountAndProject = !!(activeProject?.id && account?.id);

  const resumeAppSession = useCallback(async () => {
    setShouldWaitForOnAppStart(false);
  }, [setShouldWaitForOnAppStart]);

  const initialRoute = !hasAccountAndProject
    ? 'InviteRequired'
    : shouldRenderConsentScreen
    ? 'screens/ConsentScreen'
    : shouldLaunchOnboardingCourse
    ? 'screens/OnboardingCourseScreen'
    : 'app';

  const getLoadingMessage = useCallback(() => {
    if (loadingAccountOrProject) {
      return t('waiting-for-account-and-project', 'Loading account');
    } else if (hasAccountAndProject && loadingConsents) {
      return t('root-stack-waiting-for-consents', 'Loading consents');
    } else if (hasAccountAndProject && loadingOnboardingCourse) {
      return t(
        'root-stack-waiting-for-app-config',
        'Loading onboarding course data',
      );
    } else if (inviteParams?.inviteId) {
      return t('root-stack-accepting-invitation', 'Accepting invitation');
    } else if (loadingJoinCircles) {
      return t('root-stack-waiting-for-circle-join', 'Joining Circles');
    } else if (shouldWaitForOnAppStart) {
      return t(
        'root-stack-waiting-for-on-app-session-start',
        'Processing app session start',
      );
    }
  }, [
    hasAccountAndProject,
    inviteParams?.inviteId,
    loadingAccountOrProject,
    loadingConsents,
    loadingJoinCircles,
    loadingOnboardingCourse,
    shouldWaitForOnAppStart,
  ]);

  const loadingMessage = getLoadingMessage();

  useEffect(() => {
    const executeOnAppStartIfNeeded = async () => {
      if (shouldWaitForOnAppStart && hasAccountAndProject && activeSubjectId) {
        await onAppSessionStart?.({
          resumeAppSession,
          activeSubjectId,
          activeProject,
        });
      }
    };

    executeOnAppStartIfNeeded();
  }, [
    account,
    activeProject,
    activeSubjectId,
    hasAccountAndProject,
    onAppSessionStart,
    resumeAppSession,
    shouldWaitForOnAppStart,
  ]);

  if (loadingMessage) {
    return <ActivityIndicatorView message={loadingMessage} />;
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

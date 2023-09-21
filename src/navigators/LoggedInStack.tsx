import React, { useCallback } from 'react';
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
import { useJoinCircles } from '../hooks';
import { useSession } from '../hooks/useSession';

export function LoggedInStack() {
  const Stack = createNativeStackNavigator<LoggedInRootParamList>();
  const { inviteParams } = usePendingInvite();
  const { isLoaded } = useSession();
  const { account, isLoading: isLoadingAccount } = useActiveAccount();
  const { activeSubject, isLoading: isLoadingProject } = useActiveProject();

  useSetUserProfileEffect();
  const { useShouldRenderConsentScreen } = useConsent();
  const { shouldRenderConsentScreen, isLoading: loadingConsents } =
    useShouldRenderConsentScreen();
  const { shouldLaunchOnboardingCourse, isLoading: onboardingCourseIsLoading } =
    useOnboardingCourse();
  const { isInitialLoading: loadingJoinCircles } = useJoinCircles();

  const isLoading = !isLoaded || isLoadingAccount || isLoadingProject;
  const hasAccountAndProject = !!(activeSubject?.project?.id && account?.id);
  const initialRoute = !hasAccountAndProject
    ? 'InviteRequired'
    : shouldRenderConsentScreen
    ? 'screens/ConsentScreen'
    : shouldLaunchOnboardingCourse
    ? 'screens/OnboardingCourseScreen'
    : 'app';

  const getLoadingMessage = useCallback(() => {
    if (isLoading) {
      return t('waiting-for-session', 'Loading session');
    } else if (hasAccountAndProject && loadingConsents) {
      return t('root-stack-waiting-for-consents', 'Loading consents');
    } else if (hasAccountAndProject && onboardingCourseIsLoading) {
      return t(
        'root-stack-waiting-for-app-config',
        'Loading onboarding course data',
      );
    } else if (inviteParams?.inviteId) {
      return t('root-stack-accepting-invitation', 'Accepting invitation');
    } else if (loadingJoinCircles) {
      return t('root-stack-waiting-for-circle-join', 'Joining Circles');
    }
  }, [
    hasAccountAndProject,
    inviteParams?.inviteId,
    isLoading,
    loadingConsents,
    loadingJoinCircles,
    onboardingCourseIsLoading,
  ]);

  const loadingMessage = getLoadingMessage();
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

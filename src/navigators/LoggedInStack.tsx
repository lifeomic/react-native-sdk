import React, { useCallback, useEffect, useState } from 'react';
import { TabNavigator } from './TabNavigator';
import { ConsentScreen } from '../screens/ConsentScreen';
import { CircleThreadScreen } from '../screens/CircleThreadScreen';
import { OnboardingCourseScreen } from '../screens/OnboardingCourseScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoggedInRootParamList } from './types';
import { useConsent } from '../hooks/useConsent';
import { useActiveProject } from '../hooks/useActiveProject';
import { useOnboardingCourse } from '../hooks/useOnboardingCourse';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { t } from 'i18next';
import { useSetUserProfileEffect } from '../hooks/useSetUserProfileEffect';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { useJoinCircles } from '../hooks/Circles/useJoinCircles';
import { useProfilesForAllTiles } from '../hooks/useMessagingProfiles';
import { _sdkAnalyticsEvent } from '../common';
import { useUser } from '../hooks';

export function LoggedInStack() {
  const Stack = createNativeStackNavigator<LoggedInRootParamList>();
  useSetUserProfileEffect();
  // Fetch profiles early but don't wait for them
  useProfilesForAllTiles();
  const { isLoading, isFetched, data: user } = useUser();
  const { activeProject, activeSubjectId } = useActiveProject();
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

  const loadingOnboardingCourse =
    !onboardingCourseIsFetched || onboardingCourseIsLoading;

  const resumeAppSession = useCallback(async () => {
    setShouldWaitForOnAppStart(false);
  }, [setShouldWaitForOnAppStart]);

  const initialRoute = shouldRenderConsentScreen
    ? 'screens/ConsentScreen'
    : shouldLaunchOnboardingCourse
    ? 'screens/OnboardingCourseScreen'
    : 'app';

  const getLoadingMessage = useCallback(() => {
    if (loadingConsents) {
      return t('root-stack-waiting-for-consents', 'Loading consents');
    } else if (loadingOnboardingCourse) {
      return t(
        'root-stack-waiting-for-app-config',
        'Loading onboarding course data',
      );
    } else if (loadingJoinCircles) {
      return t('root-stack-waiting-for-circle-join', 'Joining Circles');
    } else if (shouldWaitForOnAppStart) {
      return t(
        'root-stack-waiting-for-on-app-session-start',
        'Processing app session start',
      );
    }
  }, [
    loadingConsents,
    loadingJoinCircles,
    loadingOnboardingCourse,
    shouldWaitForOnAppStart,
  ]);

  const loadingMessage = getLoadingMessage();

  useEffect(() => {
    const hasFetchedUser = !isLoading && isFetched;
    if (hasFetchedUser && user) {
      _sdkAnalyticsEvent.setUser(user.id);
    }
  }, [isFetched, isLoading, user]);

  useEffect(() => {
    activeSubjectId &&
      _sdkAnalyticsEvent.updateUserProperty('subjectId', activeSubjectId);
  }, [activeSubjectId]);

  useEffect(() => {
    const executeOnAppStartIfNeeded = async () => {
      if (shouldWaitForOnAppStart) {
        await onAppSessionStart?.({
          resumeAppSession,
          activeSubjectId,
          activeProject,
        });
      }
    };

    executeOnAppStartIfNeeded();
  }, [
    activeProject,
    activeSubjectId,
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

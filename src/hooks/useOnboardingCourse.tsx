import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useActiveConfig } from './useActiveConfig';
import { useAsyncStorage } from './useAsyncStorage';

export type OnboardingCourseContextProps = {
  shouldLaunchOnboardingCourse: boolean;
  onboardingCourseUrl?: string;
  onboardingCourseTitle?: string;
  onOnboardingCourseOpen: () => void;
  isLoading: boolean;
};

export const OnboardingCourseContext = createContext({
  shouldLaunchOnboardingCourse: false,
  onboardingCourseUrl: undefined,
  onOnboardingCourseOpen: () => {},
} as OnboardingCourseContextProps);

export const OnboardingCourseContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { subject, appConfig, isLoading } = useActiveConfig();
  const onboardingCourseUrl = appConfig?.onboardingCourse?.url;
  const onboardingCourseTitle = appConfig?.onboardingCourse?.title;
  const [storedDidLaunchResult, storeDidLaunch, isStorageLoaded] =
    useAsyncStorage(
      `${subject?.projectId}-didLaunchOnboardingCourse`,
      !!subject?.projectId,
    );

  const [didLaunchCourse, setDidLaunchCourse] = useState<boolean | undefined>(
    undefined,
  );

  const isOnboardingLoading = isLoading || !isStorageLoaded;
  const isFetched = isStorageLoaded;

  useEffect(() => {
    if (subject?.projectId) {
      setDidLaunchCourse(storedDidLaunchResult === 'true');
    }
  }, [storedDidLaunchResult, subject?.projectId]);

  /* Render the onboarding course if the following conditions are met:
    1. The app config and the async storage value have been fetched
    2. The onboarding course url is defined
    3. The onboarding course has not been launched
  */
  const shouldLaunchOnboardingCourse =
    !!isFetched && !!onboardingCourseUrl && !didLaunchCourse;

  const onOnboardingCourseOpen = useCallback(() => {
    setDidLaunchCourse(true);
    storeDidLaunch('true');
  }, [storeDidLaunch]);

  return (
    <OnboardingCourseContext.Provider
      value={{
        shouldLaunchOnboardingCourse,
        onboardingCourseUrl,
        onboardingCourseTitle,
        onOnboardingCourseOpen,
        isLoading: !!isOnboardingLoading,
      }}
    >
      {children}
    </OnboardingCourseContext.Provider>
  );
};

export const useOnboardingCourse = () =>
  React.useContext(OnboardingCourseContext);

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useAppConfig } from './useAppConfig';
import { useActiveProject } from './useActiveProject';
import { useAsyncStorage } from './useAsyncStorage';

export type OnboardingCourseContextProps = {
  shouldLaunchOnboardingCourse: boolean;
  onboardingCourseUrl?: string;
  onboardingCourseTitle?: string;
  onOnboardingCourseOpen: () => void;
  isLoading: boolean;
  isFetched: boolean;
  error?: any;
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
  const { data, isLoading, isFetched, error } = useAppConfig();
  const onboardingCourseUrl = data?.onboardingCourse?.url;
  const onboardingCourseTitle = data?.onboardingCourse?.title;
  const { activeProject } = useActiveProject();

  const [storedDidLaunchResult, storeDidLaunch] = useAsyncStorage(
    `${activeProject?.id}-didLaunchOnboardingCourse`,
  );
  const [didLaunchCourse, setDidLaunchCourse] = useState(false);

  useEffect(() => {
    if (storedDidLaunchResult.isFetched && activeProject?.id) {
      setDidLaunchCourse(storedDidLaunchResult.data === 'true');
    }
  }, [storedDidLaunchResult, activeProject?.id]);

  /* Render the onboarding course if the following conditions are met:
    1. The onboarding course url is defined
    3. The onboarding course has not been launched
  */
  const shouldLaunchOnboardingCourse =
    !!onboardingCourseUrl && !didLaunchCourse;

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
        isLoading,
        isFetched,
        error,
      }}
    >
      {children}
    </OnboardingCourseContext.Provider>
  );
};

export const useOnboardingCourse = () =>
  React.useContext(OnboardingCourseContext);

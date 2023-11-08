import React, { createContext, useCallback } from 'react';
import { useAppConfig } from './useAppConfig';
import { useActiveProject } from './useActiveProject';
import { useStoredValue } from './useStoredValue';

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
  const {
    data,
    isLoading: isAppConfigLoading,
    isFetched: isAppConfigFetched,
    error,
  } = useAppConfig();
  const onboardingCourseUrl = data?.onboardingCourse?.url;
  const onboardingCourseTitle = data?.onboardingCourse?.title;
  const { activeProject } = useActiveProject();
  const [didLaunchCourse, setDidLaunchCourse] = useStoredValue(
    `${activeProject?.id}-didLaunchOnboardingCourse`,
  );
  const isStorageLoaded = !!activeProject;

  const isLoading = isAppConfigLoading || !isStorageLoaded;
  const isFetched = isAppConfigFetched && isStorageLoaded;

  /* Render the onboarding course if the following conditions are met:
    1. The app config and the async storage value have been fetched
    2. The onboarding course url is defined
    3. The onboarding course has not been launched
  */
  const shouldLaunchOnboardingCourse =
    !!isFetched && !!onboardingCourseUrl && didLaunchCourse === 'true';

  const onOnboardingCourseOpen = useCallback(() => {
    setDidLaunchCourse('true');
  }, [setDidLaunchCourse]);

  return (
    <OnboardingCourseContext.Provider
      value={{
        shouldLaunchOnboardingCourse,
        onboardingCourseUrl,
        onboardingCourseTitle,
        onOnboardingCourseOpen,
        isLoading: !!isLoading,
        isFetched: !!isFetched,
        error,
      }}
    >
      {children}
    </OnboardingCourseContext.Provider>
  );
};

export const useOnboardingCourse = () =>
  React.useContext(OnboardingCourseContext);

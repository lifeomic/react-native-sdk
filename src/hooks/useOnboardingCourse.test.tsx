import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  OnboardingCourseContextProvider,
  useOnboardingCourse,
} from './useOnboardingCourse';
import * as useAsyncStorage from './useAsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

let useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');

beforeEach(() => {
  useAsyncStorageSpy.mockReturnValue([
    '',
    (value: string) => AsyncStorage.setItem('selectedProjectIdKey', value),
    true,
    () => {},
    () => {},
  ]);
});

const renderHookInContext = async () => {
  return renderHook(() => useOnboardingCourse(), {
    wrapper: ({ children }) => (
      <OnboardingCourseContextProvider>
        {children}
      </OnboardingCourseContextProvider>
    ),
  });
};

describe('useOnboardingCourse', () => {
  test('should return the correct context values', async () => {
    const { result } = await renderHookInContext();

    expect(result.current.shouldLaunchOnboardingCourse).toBe(true);
    expect(result.current.onboardingCourseUrl).toBe('http://example.com');
    expect(result.current.onboardingCourseTitle).toBe('Example Title');
    expect(typeof result.current.onOnboardingCourseOpen).toBe('function');
    expect(result.current.isLoading).toBe(false);
  });

  test('should set didLaunchCourse to true when calling onOnboardingCourseOpen', async () => {
    const { result } = await renderHookInContext();

    act(() => {
      result.current.onOnboardingCourseOpen();
    });

    await waitFor(() => result.current.shouldLaunchOnboardingCourse === false);
  });
});

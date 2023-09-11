import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  OnboardingCourseContextProvider,
  useOnboardingCourse,
} from './useOnboardingCourse';
import * as useAsyncStorage from './useAsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('./useAppConfig', () => ({
  useAppConfig: () => ({
    data: {
      onboardingCourse: { url: 'http://example.com', title: 'Example Title' },
    },
    isLoading: false,
    isFetched: true,
    error: null,
  }),
}));

jest.mock('./useActiveProject', () => ({
  useActiveProject: () => ({ activeProject: { id: 'project-123' } }),
}));

let useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');

beforeEach(() => {
  useAsyncStorageSpy.mockReturnValue([
    '',
    (value: string) => AsyncStorage.setItem('selectedProjectIdKey', value),
    true,
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
    expect(result.current.isFetched).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test('should set didLaunchCourse to true when calling onOnboardingCourseOpen', async () => {
    const { result } = await renderHookInContext();

    act(() => {
      result.current.onOnboardingCourseOpen();
    });

    await waitFor(() => result.current.shouldLaunchOnboardingCourse === false);
  });
});

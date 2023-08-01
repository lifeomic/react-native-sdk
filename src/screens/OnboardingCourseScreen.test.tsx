import React from 'react';
import { Button } from 'react-native';
import { render } from '@testing-library/react-native';
import { OnboardingCourseScreen } from './OnboardingCourseScreen';
import { useOnboardingCourse } from '../hooks/useOnboardingCourse';

jest.mock('../hooks/useOnboardingCourse', () => ({
  useOnboardingCourse: jest.fn(),
}));

jest.mock('../components/HeaderButton', () => Button);

const useOnboardingCourseMock = useOnboardingCourse as jest.Mock;

const navigateMock = {
  replace: jest.fn(),
  setOptions: jest.fn(),
};

const onboardingCourseScreen = (
  <OnboardingCourseScreen navigation={navigateMock as any} route={{} as any} />
);

const courseURL = 'http://unit-test/onboarding-course';
const onboardingCourseTitle = 'Onboarding Course Title';
const onOnboardingCourseOpenMock = jest.fn();

beforeEach(() => {
  useOnboardingCourseMock.mockReturnValue({
    onboardingCourseUrl: courseURL,
    onOnboardingCourseOpen: onOnboardingCourseOpenMock,
    onboardingCourseTitle,
  });
});

test('should render the course ', async () => {
  const { getByTestId } = render(onboardingCourseScreen);
  expect(getByTestId('onboarding-course-web-view')).toBeDefined();
});

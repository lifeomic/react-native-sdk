import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useOAuthFlow, useConsent, useOnboardingCourse } from '../hooks';
import { ConsentScreen } from './ConsentScreen';

jest.unmock('i18next');

jest.mock('../hooks/useOAuthFlow', () => ({
  useOAuthFlow: jest.fn(),
}));
jest.mock('../hooks/useConsent', () => ({
  useConsent: jest.fn(),
}));
jest.mock('../hooks/useOnboardingCourse', () => ({
  useOnboardingCourse: jest.fn(),
}));

const useOAuthFlowMock = useOAuthFlow as jest.Mock;
const logoutMock = jest.fn();
const useConsentMock = useConsent as jest.Mock;
const useShouldRenderConsentScreenMock = jest.fn();
const useUpdateProjectConsentDirectiveMock = jest.fn();
const useOnboardingCourseMock = useOnboardingCourse as jest.Mock;
const updateConsentDirectiveMutationMock = {
  mutateAsync: jest.fn().mockResolvedValue({}),
};
const navigateMock = {
  replace: jest.fn(),
};

const defaultConsentDirective = {
  id: 'directiveId',
  form: {
    id: 'consentId',
    item: [
      {
        linkId: 'terms',
        text: 'Consent body',
      },
      {
        linkId: 'acceptance',
        text: 'I accept',
      },
    ],
  },
};

const alertSpy = jest.spyOn(Alert, 'alert');

const consentScreen = (
  <ConsentScreen navigation={navigateMock as any} route={{} as any} />
);

beforeEach(() => {
  useOAuthFlowMock.mockReturnValue({ logout: logoutMock });

  useUpdateProjectConsentDirectiveMock.mockReturnValue(
    updateConsentDirectiveMutationMock,
  );
  useShouldRenderConsentScreenMock.mockReturnValue({
    isLoading: false,
    consentDirectives: [defaultConsentDirective],
  });
  useConsentMock.mockReturnValue({
    useShouldRenderConsentScreen: useShouldRenderConsentScreenMock,
    useUpdateProjectConsentDirective: useUpdateProjectConsentDirectiveMock,
  });
  useOnboardingCourseMock.mockReturnValue({
    shouldLaunchOnboardingCourse: false,
  });
});

test('render the activity indicator when loading', () => {
  useShouldRenderConsentScreenMock.mockReturnValue({ isLoading: true });
  const { getByTestId } = render(consentScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders the consent body and acceptance verbiage', () => {
  const { getByText } = render(consentScreen);
  expect(getByText(defaultConsentDirective.form.item[0].text)).toBeDefined();
  expect(getByText(defaultConsentDirective.form.item[1].text)).toBeDefined();
});

test('should accept the consent and navigate to the home screen', async () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Agree'));
  await waitFor(() => {
    expect(updateConsentDirectiveMutationMock.mutateAsync).toHaveBeenCalledWith(
      {
        directiveId: defaultConsentDirective.id,
        accept: true,
      },
    );
    expect(navigateMock.replace).toHaveBeenCalledWith('app');
  });
});

test('should accept the consent and navigate to the onboarding course screen', async () => {
  useOnboardingCourseMock.mockReturnValue({
    shouldLaunchOnboardingCourse: true,
  });
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Agree'));
  await waitFor(() => {
    expect(updateConsentDirectiveMutationMock.mutateAsync).toHaveBeenCalledWith(
      {
        directiveId: defaultConsentDirective.id,
        accept: true,
      },
    );
    expect(navigateMock.replace).toHaveBeenCalledWith(
      'screens/OnboardingCourseScreen',
    );
  });
});

test('it should open an alert if consent is declined', async () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Decline'));
  expect(alertSpy).toHaveBeenCalled();
});

test('Pressing logout declines the consent and logs the the user out', async () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Decline'));
  alertSpy.mock.calls[0]?.[2]?.[1].onPress!();
  await waitFor(() => {});
  expect(updateConsentDirectiveMutationMock.mutateAsync).toHaveBeenCalledWith({
    directiveId: defaultConsentDirective.id,
    accept: false,
  });
  expect(logoutMock).toHaveBeenCalled();
});

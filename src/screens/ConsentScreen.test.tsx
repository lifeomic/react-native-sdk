import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useOAuthFlow, useConsent, useOnboardingCourse } from '../hooks';
import { ConsentScreen } from './ConsentScreen';
import { useDeveloperConfig } from '../hooks';

jest.unmock('i18next');
jest.unmock('@react-navigation/native');
jest.mock('../hooks/useOAuthFlow', () => ({
  useOAuthFlow: jest.fn(),
}));
jest.mock('../hooks/useConsent', () => ({
  useConsent: jest.fn(),
}));
jest.mock('../hooks/useOnboardingCourse', () => ({
  useOnboardingCourse: jest.fn(),
}));
jest.mock('../hooks/useDeveloperConfig', () => ({
  useDeveloperConfig: jest.fn(),
}));

const useOAuthFlowMock = useOAuthFlow as jest.Mock;
const logoutMock = jest.fn();
const useConsentMock = useConsent as jest.Mock;
const useShouldRenderConsentScreenMock = jest.fn();
const useUpdateProjectConsentDirectiveMock = jest.fn();
const useOnboardingCourseMock = useOnboardingCourse as jest.Mock;
const useDeveloperConfigMock = useDeveloperConfig as jest.Mock;
const updateConsentDirectiveMutationMock = {
  mutate: jest.fn().mockResolvedValue({}),
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
        code: [
          {
            system: 'http://lifeomic.com/fhir/consent-form-item',
            code: 'Acceptance',
          },
        ],
        linkId: 'acceptance',
        text: 'I accept',
      },
      {
        code: [
          {
            system: 'http://lifeomic.com/fhir/consent-form-item',
            code: 'Acceptance',
          },
        ],
        linkId: 'acceptance-2',
        text: 'I most definitely accept',
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

  useDeveloperConfigMock.mockReturnValue({
    CustomConsentScreen: null,
  });
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

test('renders custom consent screen if present in developer config', () => {
  const CustomConsentScreen = jest.fn();

  useUpdateProjectConsentDirectiveMock.mockReturnValue({
    ...updateConsentDirectiveMutationMock,
    isLoading: false,
  });
  useDeveloperConfigMock.mockReturnValue({
    CustomConsentScreen,
  });

  render(consentScreen);

  expect(CustomConsentScreen).toHaveBeenCalled();
  expect(CustomConsentScreen).toHaveBeenCalledWith(
    {
      consentForm: defaultConsentDirective,
      acceptConsent: expect.any(Function),
      declineConsent: expect.any(Function),
      isLoadingUpdateConsent: false,
    },
    {},
  );

  // check passed methods are correct
  const { acceptConsent, declineConsent } =
    CustomConsentScreen.mock.calls[0][0];

  acceptConsent();
  useUpdateProjectConsentDirectiveMock.mock.calls[0][0].onSuccess(undefined, {
    status: 'active',
  });
  expect(navigateMock.replace).toHaveBeenCalledWith('app');
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledTimes(1);
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledWith({
    directiveId: defaultConsentDirective.id,
    accept: true,
  });

  // reset for later assertions
  updateConsentDirectiveMutationMock.mutate.mockClear();

  declineConsent();
  expect(alertSpy).toHaveBeenCalled();
  alertSpy.mock.calls[0]?.[2]?.[1].onPress!();
  useUpdateProjectConsentDirectiveMock.mock.calls[0][0].onSuccess(undefined, {
    status: 'rejected',
  });
  () => expect(logoutMock).toHaveBeenCalledTimes(1);
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledTimes(1);
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledWith({
    directiveId: defaultConsentDirective.id,
    accept: false,
  });

  // check passed loading state
  useUpdateProjectConsentDirectiveMock.mockReturnValue({
    ...updateConsentDirectiveMutationMock,
    isLoading: true,
  });

  CustomConsentScreen.mockClear();
  render(consentScreen);

  expect(CustomConsentScreen).toHaveBeenCalled();
  expect(CustomConsentScreen).toHaveBeenCalledWith(
    {
      consentForm: defaultConsentDirective,
      acceptConsent: expect.any(Function),
      declineConsent: expect.any(Function),
      isLoadingUpdateConsent: true,
    },
    {},
  );
});

test('renders the consent body and acceptance verbiage', () => {
  const { getByText } = render(consentScreen);
  expect(getByText(defaultConsentDirective.form.item[0].text)).toBeDefined();
  expect(getByText(defaultConsentDirective.form.item[1].text)).toBeDefined();
  expect(getByText(defaultConsentDirective.form.item[2].text)).toBeDefined();
});

test('should accept the consent and navigate to the home screen', () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Agree'));
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledWith({
    directiveId: defaultConsentDirective.id,
    accept: true,
  });
  useUpdateProjectConsentDirectiveMock.mock.calls[0][0].onSuccess(undefined, {
    status: 'active',
  });
  expect(navigateMock.replace).toHaveBeenCalledWith('app');
});

test('should accept the consent and navigate to the onboarding course screen', () => {
  useOnboardingCourseMock.mockReturnValue({
    shouldLaunchOnboardingCourse: true,
  });
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Agree'));
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledWith({
    directiveId: defaultConsentDirective.id,
    accept: true,
  });
  useUpdateProjectConsentDirectiveMock.mock.calls[0][0].onSuccess(undefined, {
    status: 'active',
  });
  expect(navigateMock.replace).toHaveBeenCalledWith(
    'screens/OnboardingCourseScreen',
  );
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
  expect(updateConsentDirectiveMutationMock.mutate).toHaveBeenCalledWith({
    directiveId: defaultConsentDirective.id,
    accept: false,
  });
  useUpdateProjectConsentDirectiveMock.mock.calls[0][0].onSuccess(undefined, {
    status: 'rejected',
  });
  expect(logoutMock).toHaveBeenCalled();
});

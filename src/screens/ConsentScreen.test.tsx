import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useOAuthFlow, useConsent } from '../hooks';
import { ConsentScreen } from './ConsentScreen';

jest.unmock('i18next');

jest.mock('../hooks/useOAuthFlow', () => ({
  useOAuthFlow: jest.fn(),
}));
jest.mock('../hooks/useConsent', () => ({
  useConsent: jest.fn(),
}));

const useOAuthFlowMock = useOAuthFlow as jest.Mock;
const logoutMock = jest.fn();
const useConsentMock = useConsent as jest.Mock;
const useDefaultConsentMock = jest.fn();
const useUpdateProjectConsentDirectiveMock = jest.fn();
const updateConsentDirectiveMutationMock = {
  mutateAsync: jest.fn().mockResolvedValue({}),
};
const navigateMock = {
  replace: jest.fn(),
};

const defaultConsent = {
  id: 'consentId',
  item: [
    {
      text: 'Consent body',
    },
  ],
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
  useDefaultConsentMock.mockReturnValue({
    isLoading: false,
    data: defaultConsent,
  });
  useConsentMock.mockReturnValue({
    useDefaultConsent: useDefaultConsentMock,
    useUpdateProjectConsentDirective: useUpdateProjectConsentDirectiveMock,
  });
});

test('render the activity indicator when loading the default consent', () => {
  useDefaultConsentMock.mockReturnValue({ isLoading: true });
  const { getByTestId } = render(consentScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders the consent body', () => {
  const { getByText } = render(consentScreen);
  expect(getByText(defaultConsent.item[0].text)).toBeDefined();
});

test('should accept the consent and navigate to the home screen', async () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Agree'));
  await waitFor(() => {
    expect(updateConsentDirectiveMutationMock.mutateAsync).toHaveBeenCalledWith(
      true,
    );
    expect(navigateMock.replace).toHaveBeenCalledWith('app');
  });
});

test('it should open an alert', async () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Decline'));
  expect(alertSpy).toHaveBeenCalled();
});

test('Pressing logout declines the consent and logs the the user out', async () => {
  const { getByText } = render(consentScreen);
  fireEvent.press(getByText('Decline'));
  alertSpy.mock.calls[0]?.[2]?.[1].onPress!();
  await waitFor(() => {});
  expect(updateConsentDirectiveMutationMock.mutateAsync).toHaveBeenCalledWith(
    false,
  );
  expect(logoutMock).toHaveBeenCalled();
});

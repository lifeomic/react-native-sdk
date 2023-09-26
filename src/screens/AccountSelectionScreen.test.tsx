import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccountSelectionScreen } from './AccountSelectionScreen';
import { useNavigation } from '@react-navigation/native';
import {
  mockActiveAccount,
  mockUseSession,
} from '../common/testHelpers/mockSession';

const setActiveAccountId = jest.fn();
const goBackMock = jest.fn();
const useNavigationMock = jest.fn().mockReturnValue({
  canGoBack: () => true,
  goBack: goBackMock,
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => useNavigationMock(),
}));

test('renders buttons to select account', async () => {
  mockUseSession({ accounts: [{ id: 'account1' }, { id: 'account2' }] });
  const { getByTestId } = await render(
    <AccountSelectionScreen
      navigation={useNavigation() as any}
      route={{} as any}
    />,
  );

  expect(getByTestId('select-account-account1')).toBeDefined();
  expect(getByTestId('select-account-account2')).toBeDefined();
});

test('allows for selecting account via button', async () => {
  mockUseSession({ accounts: [{ id: 'account1' }, { id: 'account2' }] });
  mockActiveAccount(false, setActiveAccountId);
  const { getByTestId } = await render(
    <AccountSelectionScreen
      navigation={useNavigation() as any}
      route={{} as any}
    />,
  );

  await waitFor(() => {
    expect(getByTestId('select-account-account2')).toBeDefined();
  });

  fireEvent.press(getByTestId('select-account-account2'));

  await waitFor(() => {
    expect(setActiveAccountId).toHaveBeenCalledTimes(1);
    expect(setActiveAccountId.mock.calls[0]).toEqual(['account2']);
    expect(goBackMock).toHaveBeenCalledTimes(1);
  });
});

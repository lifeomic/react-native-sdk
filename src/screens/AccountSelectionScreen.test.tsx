import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AccountSelectionScreen } from './AccountSelectionScreen';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useNavigation } from '@react-navigation/native';

jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;

const setActiveAccountId = jest.fn();
const useNavigationMock = useNavigation as jest.Mock;
const goBackMock = jest.fn();

beforeEach(() => {
  useNavigationMock.mockReturnValue({
    canGoBack: () => true,
    goBack: goBackMock,
  });
});

test('renders buttons to select account', async () => {
  useActiveAccountMock.mockReturnValue({
    accountsWithProduct: [
      {
        id: 'account1',
      },
      {
        id: 'account2',
      },
    ],
    setActiveAccountId,
  });
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
  useActiveAccountMock.mockReturnValue({
    accountsWithProduct: [
      {
        id: 'account1',
      },
      {
        id: 'account2',
      },
    ],
    setActiveAccountId,
  });
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

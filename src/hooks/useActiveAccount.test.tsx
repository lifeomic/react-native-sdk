import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { useAccounts } from './useAccounts';
import {
  ActiveAccountContextProvider,
  useActiveAccount,
} from './useActiveAccount';

jest.mock('./useAccounts', () => ({
  useAccounts: jest.fn(),
}));

const useAccountsMock = useAccounts as jest.Mock;
const refetchMock = jest.fn();

const accountId1 = 'acct1';
const accountId2 = 'acct2';

const mockAccounts = [
  {
    id: accountId1,
    products: ['LR'],
  },
  {
    id: accountId2,
    products: ['LR'],
  },
];

const renderHookInContext = async () => {
  return renderHook(() => useActiveAccount(), {
    wrapper: ({ children }) => (
      <ActiveAccountContextProvider>{children}</ActiveAccountContextProvider>
    ),
  });
};

beforeEach(() => {
  useAccountsMock.mockReturnValue({
    data: mockAccounts,
    refetch: refetchMock,
  });
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useActiveAccount());
  await expect(result.current.refetch()).rejects.toBeUndefined();
  await expect(
    result.current.setActiveAccountId('bogus'),
  ).rejects.toBeUndefined();
});

test('converts useAccounts data into helpful state', async () => {
  const { result } = await renderHookInContext();
  expect(result.current).toMatchObject({
    account: mockAccounts[0],
    accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
    accountsWithProduct: mockAccounts,
  });
});

test('exposes some props from useAccounts', async () => {
  const error = new Error('uh oh');
  useAccountsMock.mockReturnValue({
    isLoading: true,
    isFetched: true,
    error,
  });

  const { result } = await renderHookInContext();

  expect(result.current).toMatchObject({
    isLoading: true,
    isFetched: true,
    error,
  });
});

test('refetch forwards to useAccounts', async () => {
  const { result } = await renderHookInContext();

  await act(async () => {
    result.current.refetch();
  });

  expect(refetchMock).toHaveBeenCalled();
});

test('setActiveAccountId saves accountId', async () => {
  const { result } = await renderHookInContext();

  expect(result.current).toMatchObject({
    account: mockAccounts[0],
  });

  await act(async () => {
    result.current.setActiveAccountId(accountId2);
  });

  expect(result.current).toMatchObject({
    account: mockAccounts[1],
  });
});

test('setActiveAccountId ignores invalid accountId', async () => {
  const { result } = await renderHookInContext();

  await act(async () => {
    result.current.setActiveAccountId('invalid account');
  });

  expect(result.current).toMatchObject({
    account: mockAccounts[0],
  });
});

test('indicates expired trial', async () => {
  const expiredTrialAccount = {
    id: 'acct',
    name: 'name',
    type: 'FREE',
    products: ['LR'],
    trialActive: true,
    trialEndDate: new Date(Date.now() - 1),
  };
  useAccountsMock.mockReturnValue({
    data: [expiredTrialAccount],
  });
  const { result } = await renderHookInContext();

  expect(result.current).toMatchObject({
    account: expiredTrialAccount,
    trialExpired: true,
  });
});

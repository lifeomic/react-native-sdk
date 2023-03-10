import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAccounts } from './useAccounts';
import {
  ActiveAccountContextProvider,
  useActiveAccount,
} from './useActiveAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { QueryClient, QueryClientProvider, UseQueryResult } from 'react-query';
import { mockDeep } from 'jest-mock-extended';
import * as useAsyncStorage from './useAsyncStorage';

jest.mock('./useAccounts', () => ({
  useAccounts: jest.fn(),
}));

const useAccountsMock = useAccounts as jest.Mock;

const refetchMock = jest.fn();
let useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');

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

const renderHookInContext = async (accountIdToSelect?: string) => {
  return renderHook(() => useActiveAccount(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <ActiveAccountContextProvider accountIdToSelect={accountIdToSelect}>
          {children}
        </ActiveAccountContextProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useAccountsMock.mockReturnValue({
    data: mockAccounts,
    refetch: refetchMock,
  });
  useAsyncStorageSpy.mockReturnValue([
    {
      ...mockDeep<UseQueryResult<string | null>>(),
    },
    (value: string) => AsyncStorage.setItem('selectedAccountId', value),
  ]);
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

test('provider allows for account override by id', async () => {
  const { result } = await renderHookInContext(accountId2);
  expect(result.current).toMatchObject({
    account: mockAccounts[1],
  });
});

test('uses account from async storage', async () => {
  useAsyncStorageSpy.mockRestore();

  AsyncStorageMock.getItem = jest.fn().mockResolvedValueOnce(accountId1);
  const { result, rerender } = await renderHookInContext();
  await waitFor(() => result.current.isLoading === false);
  rerender({});
  expect(AsyncStorage.getItem).toBeCalledWith('selectedAccountId');
  expect(result.current).toMatchObject({
    account: mockAccounts[0],
    accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
    accountsWithProduct: mockAccounts,
  });

  AsyncStorageMock.getItem = jest.fn().mockResolvedValueOnce(accountId2);
  const { result: nextResult, rerender: nextRerender } =
    await renderHookInContext();
  await waitFor(() => nextResult.current.isLoading === false);
  nextRerender({});
  expect(nextResult.current).toMatchObject({
    account: mockAccounts[1],
    accountHeaders: { 'LifeOmic-Account': mockAccounts[1].id },
    accountsWithProduct: mockAccounts,
  });

  useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');
});

test('initial render writes selected account to async storage', async () => {
  await renderHookInContext(accountId2);
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedAccountId',
    accountId2,
  );
});

test('setAccountAccountId writes selected account to async storage', async () => {
  const { result } = await renderHookInContext();
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedAccountId',
    accountId1,
  );
  await act(async () => {
    result.current.setActiveAccountId(accountId2);
  });
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedAccountId',
    accountId2,
  );
});

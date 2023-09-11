import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  ActiveAccountContextProvider,
  useActiveAccount,
} from './useActiveAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as useAsyncStorage from './useAsyncStorage';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';
import { useUser } from './useUser';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';

const api = createRestAPIMock();

jest.mock('./useUser', () => ({
  useUser: jest.fn(),
}));

const useUserMock = useUser as jest.Mock;

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

const queryMock = jest.fn();

beforeEach(() => {
  api.mock(
    'GET /v1/accounts',
    queryMock.mockReturnValue({
      status: 200,
      data: { accounts: mockAccounts },
    }),
  );
  useAsyncStorageSpy.mockReturnValue([
    '',
    (value: string) =>
      AsyncStorage.setItem('selectedAccountId:mockUser', value),
    true,
  ]);
  useUserMock.mockReturnValue({
    data: { id: 'mockUser' },
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
  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
      accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
      accountsWithProduct: mockAccounts,
    }),
  );
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('exposes some props from useAccounts', async () => {
  api.mock('GET /v1/accounts', async () => {
    // wait to simulate a loading state
    await wait(200);
    throw new Error('dummy error');
  });
  const { result } = await renderHookInContext();
  expect(result.current).toMatchObject({
    isLoading: true,
  });
});

test('refetch forwards to useAccounts', async () => {
  const { result } = await renderHookInContext();

  await waitFor(() => expect(queryMock).toHaveBeenCalledTimes(1));

  await act(async () => {
    result.current.refetch();
  });

  await waitFor(() => expect(queryMock).toHaveBeenCalledTimes(2));
});

test('setActiveAccountId saves accountId', async () => {
  const { result } = await renderHookInContext();

  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
    }),
  );

  await act(async () => {
    result.current.setActiveAccountId(accountId2);
  });

  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[1],
    }),
  );
});

test('setActiveAccountId ignores invalid accountId', async () => {
  const { result } = await renderHookInContext();

  await act(async () => {
    result.current.setActiveAccountId('invalid account');
  });

  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
    }),
  );
});

test('indicates expired trial', async () => {
  const expiredTrialAccount = {
    id: 'acct',
    name: 'name',
    type: 'FREE',
    products: ['LR'],
    trialActive: true,
    trialEndDate: new Date(Date.now() - 1).toISOString(),
  };
  api.mock('GET /v1/accounts', {
    status: 200,
    data: { accounts: [expiredTrialAccount as any] },
  });

  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current).toMatchObject({
      account: expiredTrialAccount,
      trialExpired: true,
    });
  });
});

test('provider allows for account override by id', async () => {
  const { result } = await renderHookInContext(accountId2);
  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[1],
    }),
  );
});

test('uses account from async storage', async () => {
  useAsyncStorageSpy.mockRestore();

  AsyncStorageMock.getItem = jest.fn().mockResolvedValueOnce(accountId1);
  const { result, rerender } = await renderHookInContext();
  await waitFor(() => result.current.isLoading === false);
  rerender({});
  expect(AsyncStorage.getItem).toBeCalledWith('selectedAccountId:mockUser');
  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
      accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
      accountsWithProduct: mockAccounts,
    }),
  );

  AsyncStorageMock.getItem = jest.fn().mockResolvedValueOnce(accountId2);
  const { result: nextResult, rerender: nextRerender } =
    await renderHookInContext();
  await waitFor(() => nextResult.current.isLoading === false);
  nextRerender({});
  await waitFor(() =>
    expect(nextResult.current).toMatchObject({
      account: mockAccounts[1],
      accountHeaders: { 'LifeOmic-Account': mockAccounts[1].id },
      accountsWithProduct: mockAccounts,
    }),
  );

  useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');
});

test('initial render writes selected account to async storage', async () => {
  await renderHookInContext(accountId2);
  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      'selectedAccountId:mockUser',
      accountId2,
    ),
  );
});

test('setAccountAccountId writes selected account to async storage', async () => {
  const { result } = await renderHookInContext();
  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      'selectedAccountId:mockUser',
      accountId1,
    ),
  );
  await act(async () => {
    result.current.setActiveAccountId(accountId2);
  });
  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      'selectedAccountId:mockUser',
      accountId2,
    ),
  );
});

test('handles accepted invites by refetching and setting account', async () => {
  api.mock('GET /v1/accounts', { status: 200, data: { accounts: [] } });
  const { rerender } = await renderHookInContext();
  const invitedAccountId = 'invite-account-id';
  act(() => {
    api.mock('GET /v1/accounts', {
      status: 200,
      data: { accounts: [{ id: invitedAccountId, products: ['LR'] } as any] },
    });

    inviteNotifier.emit('inviteAccepted', {
      id: 'invite-id',
      account: invitedAccountId,
      accountName: 'Unit test acct',
      email: 'invitee@email.com',
      status: 'ACCEPTED',
      expirationTimestamp: '2025',
    });
    rerender({});
  });

  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      'selectedAccountId:mockUser',
      invitedAccountId,
    ),
  );
});

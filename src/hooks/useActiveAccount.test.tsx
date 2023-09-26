import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.unmock('./useActiveAccount');
import {
  ActiveAccountContextProvider,
  useActiveAccount,
} from './useActiveAccount';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as useAsyncStorage from './useAsyncStorage';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';
import { mockUseSession, mockUser } from '../common/testHelpers/mockSession';

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
  jest.unmock('./useActiveAccount');
  mockUseSession({ accounts: mockAccounts, user: mockUser });
  useAsyncStorageSpy.mockReturnValue([
    '',
    (value: string) =>
      AsyncStorage.setItem(`selectedAccountId:${mockUser.id}`, value),
    true,
    () => {},
    () => {},
  ]);
});

test('converts useAccounts data into helpful state', async () => {
  const { result } = await renderHookInContext();
  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
      accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
    }),
  );
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

test('indicates expired trial', async () => {
  const expiredTrialAccount = {
    id: 'acct',
    name: 'name',
    type: 'FREE',
    products: ['LR'],
    trialActive: true,
    trialEndDate: new Date(Date.now() - 1).toISOString(),
    description: '',
    logo: '',
    features: [],
  };

  mockUseSession({ accounts: [expiredTrialAccount], user: mockUser });
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
  expect(AsyncStorage.getItem).toBeCalledWith(
    `selectedAccountId:${mockUser.id}`,
  );
  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
      accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
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
    }),
  );

  useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');
});

test('initial render writes selected account to async storage', async () => {
  await renderHookInContext(accountId2);
  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      `selectedAccountId:${mockUser.id}`,
      accountId2,
    ),
  );
});

test('setAccountAccountId writes selected account to async storage', async () => {
  const { result } = await renderHookInContext();
  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      `selectedAccountId:${mockUser.id}`,
      accountId1,
    ),
  );
  await act(async () => {
    result.current.setActiveAccountId(accountId2);
  });
  await waitFor(() =>
    expect(AsyncStorageMock.setItem).toBeCalledWith(
      `selectedAccountId:${mockUser.id}`,
      accountId2,
    ),
  );
});

test.only('handles accepted invites by clearing session', async () => {
  const clearSessionMock = jest.fn(() => console.log('Yup! Called'));
  jest.unmock('./useSession');

  const { rerender } = await renderHookInContext();
  const invitedAccountId = 'invite-account-id';
  act(() => {
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

  await waitFor(() => expect(clearSessionMock).toHaveBeenCalled());
});

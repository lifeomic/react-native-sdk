import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  ActiveAccountContextProvider,
  PREFERRED_ACCOUNT_ID_KEY,
  useActiveAccount,
} from './useActiveAccount';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { _store } from './useStoredValue';

const api = createRestAPIMock();

jest.mock('./useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: true,
  }),
}));

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

  _store.clearAll();
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useActiveAccount());
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
  };
  api.mock('GET /v1/accounts', {
    status: 200,
    data: { accounts: [expiredTrialAccount as any] },
  });

  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current).toMatchObject({
      account: expiredTrialAccount,
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

test('uses account from mmkv', async () => {
  _store.set(PREFERRED_ACCOUNT_ID_KEY, accountId1);
  const { result, rerender, unmount } = await renderHookInContext();
  await waitFor(() => result.current.isLoading === false);
  rerender({});

  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: mockAccounts[0],
      accountHeaders: { 'LifeOmic-Account': mockAccounts[0].id },
      accountsWithProduct: mockAccounts,
    }),
  );
  unmount();

  _store.set(PREFERRED_ACCOUNT_ID_KEY, accountId2);
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
});

test('initial render writes selected account to async storage', async () => {
  await renderHookInContext(accountId2);
  await waitFor(() =>
    expect(_store.getString(PREFERRED_ACCOUNT_ID_KEY)).toStrictEqual(
      accountId2,
    ),
  );
});

test('setAccountAccountId writes selected account to async storage', async () => {
  const { result } = await renderHookInContext();
  await waitFor(() =>
    expect(_store.getString(PREFERRED_ACCOUNT_ID_KEY)).toStrictEqual(
      accountId1,
    ),
  );
  await act(async () => {
    result.current.setActiveAccountId(accountId2);
  });
  await waitFor(() =>
    expect(_store.getString(PREFERRED_ACCOUNT_ID_KEY)).toStrictEqual(
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
    expect(_store.getString(PREFERRED_ACCOUNT_ID_KEY)).toStrictEqual(
      invitedAccountId,
    ),
  );
});

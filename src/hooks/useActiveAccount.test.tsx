import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { ActiveAccountProvider, useActiveAccount } from './useActiveAccount';

const renderHookInContext = async (account: string) => {
  return renderHook(() => useActiveAccount(), {
    wrapper: ({ children }) => (
      <ActiveAccountProvider account={account}>
        {children}
      </ActiveAccountProvider>
    ),
  });
};

test('without provider, methods fail', () => {
  expect(() => {
    renderHook(() => useActiveAccount());
  }).toThrow(
    'useActiveAccount must be used within a ActiveAccountContextProvider',
  );
});

test('converts useAccounts data into helpful state', async () => {
  const { result } = await renderHookInContext('test-account');
  await waitFor(() =>
    expect(result.current).toMatchObject({
      account: 'test-account',
    }),
  );
});

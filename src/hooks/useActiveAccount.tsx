import React, { createContext, useEffect, useContext } from 'react';
import { Account } from '../types/rest-types';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';
import { ProjectInvite } from '../types';
import { useRestCache, useRestQuery } from './rest-api';
import { useStoredValue } from './useStoredValue';
import { InviteRequiredScreen } from '../screens/InviteRequiredScreen';

export type ActiveAccountProps = {
  account?: Account;
  accountsWithProduct?: Account[];
  accountHeaders?: Record<string, string>;
};

export type ActiveAccountContextProps = ActiveAccountProps & {
  setActiveAccountId: (accountId: string) => void;
  isLoading: boolean;
  isFetched: boolean;
  error?: any;
};

export const ActiveAccountContext = createContext({
  setActiveAccountId: () => Promise.reject(),
  isLoading: true,
  isFetched: false,
} as ActiveAccountContextProps);

export const PREFERRED_ACCOUNT_ID_KEY = 'preferred-account-id';

export const ActiveAccountContextProvider = ({
  children,
  accountIdToSelect,
}: {
  children?: React.ReactNode;
  /** Force provider to select the available account
   * that matches the specified account id.
   * Uses first available account if not specified.
   */
  accountIdToSelect?: string;
}) => {
  const accountsResult = useRestQuery(
    'GET /v1/accounts',
    {},
    {
      select: (data) => data.accounts.filter((a) => a.products.includes('LR')),
    },
  );

  const accountsWithProduct = accountsResult.data ?? [];
  const [preferredId, setPreferredId] = useStoredValue(
    PREFERRED_ACCOUNT_ID_KEY,
  );
  const cache = useRestCache();

  const selectedAccount = accountsWithProduct.length
    ? accountsWithProduct?.find(
        // Prefer the prop override first. Otherwise, use the stored preference.
        (a) => a.id === (accountIdToSelect || preferredId),
      ) ??
      // Otherwise, use the first account in the list.
      accountsWithProduct[0]
    : undefined;

  // Whenever the user's account changes, use the new account as
  // the preferred account.
  useEffect(() => {
    if (selectedAccount?.id) {
      setPreferredId(selectedAccount.id);
    }
  }, [selectedAccount, setPreferredId]);

  // When the user accepts an invite to a new account, reset the cache,
  // and also use _that_ account as the preferred account.
  useEffect(() => {
    const listener = async (acceptedInvite: ProjectInvite) => {
      cache.resetQueries({ 'GET /v1/accounts': 'all' });
      setPreferredId(acceptedInvite.account);
      inviteNotifier.emit('inviteAccountSettled');
    };
    inviteNotifier.addListener('inviteAccepted', listener);
    return () => {
      inviteNotifier.removeListener('inviteAccepted', listener);
    };
  }, [cache, setPreferredId]);

  /**
   * This check is temporary. It will be refactored out in a subsequent PR.
   */
  if (accountsResult.status === 'success' && !selectedAccount) {
    return <InviteRequiredScreen />;
  }

  return (
    <ActiveAccountContext.Provider
      value={{
        account: selectedAccount,
        accountHeaders: selectedAccount
          ? { 'LifeOmic-Account': selectedAccount.id }
          : undefined,
        accountsWithProduct,
        setActiveAccountId: setPreferredId,
        isLoading: accountsResult.isLoading,
        isFetched: accountsResult.isFetched,
        error: accountsResult.error,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
};

export const useActiveAccount = () => useContext(ActiveAccountContext);

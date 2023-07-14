import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import { Account, useAccounts } from './useAccounts';
import { QueryObserverResult } from 'react-query';
import { useAsyncStorage } from './useAsyncStorage';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';
import { ProjectInvite } from '../types';
import { useUser } from './useUser';

export type ActiveAccountProps = {
  account?: Account;
  accountsWithProduct?: Account[];
  accountHeaders?: Record<string, string>;
  trialExpired?: boolean;
};

export type ActiveAccountContextProps = ActiveAccountProps & {
  refetch: () => Promise<QueryObserverResult<Account[], unknown>>;
  setActiveAccountId: (accountId: string) => Promise<void>;
  isLoading: boolean;
  isFetched: boolean;
  error?: any;
};

export const ActiveAccountContext = createContext({
  refetch: () => Promise.reject(),
  setActiveAccountId: () => Promise.reject(),
  isLoading: true,
  isFetched: false,
} as ActiveAccountContextProps);

const selectedAccountIdKey = 'selectedAccountId';

const filterNonLRAccounts = (accounts?: Account[]) =>
  accounts?.filter((a) => a.products?.indexOf('LR') > -1) || [];

const getValidAccount = (validAccounts?: Account[], accountId?: string) => {
  return validAccounts?.find((a) => a.id === accountId);
};

const getTrialExpired = (account: Account) =>
  account.type === 'FREE'
    ? !account.trialActive || new Date(account.trialEndDate) < new Date()
    : undefined;

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
  const accountsResult = useAccounts();
  const accountsWithProduct = filterNonLRAccounts(accountsResult.data);
  const [activeAccount, setActiveAccount] = useState<ActiveAccountProps>({});
  const { data } = useUser();
  const [userId, setUserId] = useState(data?.id);
  const [storedAccountIdResult, setStoredAccountId] = useAsyncStorage(
    `${selectedAccountIdKey}:${data?.id}`,
  );

  /**
   * Initial setting of activeAccount
   */
  useEffect(() => {
    if (
      !data?.id || // require user id before reading/writing to storage
      storedAccountIdResult.isLoading || // wait for async storage result
      activeAccount?.account?.id || // activeAccount already set
      accountsWithProduct.length < 1 // no valid accounts found server side
    ) {
      return;
    }

    const accountToSelect =
      accountIdToSelect ?? storedAccountIdResult.data ?? undefined;

    const selectedAccount =
      getValidAccount(accountsWithProduct, accountToSelect) ??
      accountsWithProduct[0];

    setActiveAccount({
      account: selectedAccount,
      accountHeaders: {
        'LifeOmic-Account': selectedAccount.id,
      },
      trialExpired: getTrialExpired(selectedAccount),
    });
    setStoredAccountId(selectedAccount.id);
  }, [
    accountsWithProduct,
    activeAccount?.account?.id,
    accountIdToSelect,
    setStoredAccountId,
    storedAccountIdResult.data,
    storedAccountIdResult.isLoading,
    data?.id,
  ]);

  // Clear selected account when
  // we've detected that the userId has changed
  useEffect(() => {
    if (data?.id !== userId) {
      setActiveAccount({});
      setUserId(data?.id);
    }
  }, [data?.id, userId]);

  const setActiveAccountId = useCallback(
    async (accountId: string) => {
      try {
        const selectedAccount = getValidAccount(accountsWithProduct, accountId);
        if (!selectedAccount) {
          if (process.env.NODE_ENV !== 'test') {
            console.warn(
              'Ignoring attempt to set invalid accountId',
              accountId,
            );
          }
          return;
        }

        setActiveAccount({
          account: selectedAccount,
          accountHeaders: {
            'LifeOmic-Account': selectedAccount.id,
          },
          trialExpired: getTrialExpired(selectedAccount),
        });
        await setStoredAccountId(selectedAccount.id);
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.warn('Unable to set active account', error);
        }
      }
    },
    [accountsWithProduct, setStoredAccountId],
  );

  const refetch = useCallback(async () => {
    return accountsResult.refetch();
  }, [accountsResult]);

  // Handle invite accept
  useEffect(() => {
    const listener = async (acceptedInvite: ProjectInvite) => {
      await refetch();
      await setActiveAccountId(acceptedInvite.account);
      inviteNotifier.emit('inviteAccountSettled');
    };
    inviteNotifier.addListener('inviteAccepted', listener);
    return () => {
      inviteNotifier.removeListener('inviteAccepted', listener);
    };
  }, [refetch, setActiveAccountId]);

  return (
    <ActiveAccountContext.Provider
      value={{
        ...activeAccount,
        accountsWithProduct,
        refetch,
        setActiveAccountId,
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

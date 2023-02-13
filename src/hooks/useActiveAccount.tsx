import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import { Account, useAccounts } from './useAccounts';
import { RawAxiosRequestHeaders } from 'axios';
import { QueryObserverResult } from 'react-query';

export type ActiveAccountProps = {
  account?: Account;
  accountsWithProduct?: Account[];
  accountHeaders?: RawAxiosRequestHeaders;
  trialExpired?: boolean;
};

export type ActiveAccountContextProps = ActiveAccountProps & {
  refetch: () => Promise<QueryObserverResult<Account[], unknown>>;
  setActiveAccountId: (accountId: string) => Promise<void>;
  isLoading: boolean;
  isFetched: boolean;
  error?: any;
};

const ActiveAccountContext = createContext({
  refetch: () => Promise.reject(),
  setActiveAccountId: () => Promise.reject(),
  isLoading: true,
  isFetched: false,
} as ActiveAccountContextProps);

// TODO: add configuration for product to check
const filterAccounts = (accounts?: Account[]) =>
  accounts?.filter((a) => a.products?.indexOf('LR') > -1) || [];

const getTrialExpired = (account: Account) =>
  account.type === 'FREE'
    ? !account.trialActive || new Date(account.trialEndDate) < new Date()
    : undefined;

// TODO: allow for injecting account which is always used
export const ActiveAccountContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const accounts = useAccounts();
  const [activeAccount, setActiveAccount] = useState<ActiveAccountProps>({});

  /**
   * Initial setting of activeAccount
   */
  useEffect(() => {
    if (activeAccount?.account?.id) {
      return;
    }
    const accountsWithProduct = filterAccounts(accounts.data);
    if (accountsWithProduct.length < 1) {
      return;
    }

    // TODO: use previously-selected account logic
    const selectedAccount = accountsWithProduct[0];

    setActiveAccount({
      account: selectedAccount,
      accountHeaders: {
        'LifeOmic-Account': selectedAccount.id,
      },
      trialExpired: getTrialExpired(selectedAccount),
      accountsWithProduct,
    });
  }, [accounts.data, activeAccount?.account?.id]);

  const setActiveAccountId = useCallback(
    async (accountId: string) => {
      try {
        const selectedAccount = filterAccounts(accounts.data).find(
          (a) => a.id === accountId,
        );
        if (!selectedAccount) {
          console.warn('Ignoring attempt to set invalid accountId', accountId);
          return;
        }

        // TODO: Save for previously-selected account logic

        setActiveAccount({
          account: selectedAccount,
          trialExpired: getTrialExpired(selectedAccount),
        });
      } catch (error) {
        console.warn('Unable to set active account', error);
      }
    },
    [accounts.data],
  );

  const refetch = useCallback(async () => {
    return accounts.refetch();
  }, [accounts]);

  return (
    <ActiveAccountContext.Provider
      value={{
        ...activeAccount,
        refetch,
        setActiveAccountId,
        isLoading: accounts.isLoading,
        isFetched: accounts.isFetched,
        error: accounts.error,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
};

export const useActiveAccount = () => useContext(ActiveAccountContext);

export default ActiveAccountContext;

import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import { Account, useAccounts } from './useAccounts';
import { QueryObserverResult } from 'react-query';

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
  const accountsResult = useAccounts();
  const [accountsWithProduct, setAccountsWithProduct] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<ActiveAccountProps>({});

  /**
   * Initial setting of activeAccount
   */
  useEffect(() => {
    if (activeAccount?.account?.id) {
      return;
    }
    const filteredAccounts = filterAccounts(accountsResult.data);
    if (filteredAccounts.length < 1) {
      return;
    }
    setAccountsWithProduct(filteredAccounts);

    // TODO: use previously-selected account logic
    const selectedAccount = filteredAccounts[0];

    setActiveAccount({
      account: selectedAccount,
      accountHeaders: {
        'LifeOmic-Account': selectedAccount.id,
      },
      trialExpired: getTrialExpired(selectedAccount),
    });
  }, [accountsResult.data, activeAccount?.account?.id]);

  const setActiveAccountId = useCallback(
    async (accountId: string) => {
      try {
        const selectedAccount = filterAccounts(accountsWithProduct).find(
          (a) => a.id === accountId,
        );
        if (!selectedAccount) {
          console.warn('Ignoring attempt to set invalid accountId', accountId);
          return;
        }

        // TODO: Save for previously-selected account logic

        setActiveAccount({
          account: selectedAccount,
          accountHeaders: {
            'LifeOmic-Account': selectedAccount.id,
          },
          trialExpired: getTrialExpired(selectedAccount),
        });
      } catch (error) {
        console.warn('Unable to set active account', error);
      }
    },
    [accountsWithProduct],
  );

  const refetch = useCallback(async () => {
    return accountsResult.refetch();
  }, [accountsResult]);

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

export default ActiveAccountContext;

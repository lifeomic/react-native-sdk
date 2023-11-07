import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { Account } from '../types/rest-types';
import { useAsyncStorage } from './useAsyncStorage';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';
import { ProjectInvite } from '../types';
import { useUser } from './useUser';
import { useRestCache, useRestQuery } from './rest-api';
import { useAuth } from './useAuth';

export type ActiveAccountProps = {
  account?: Account;
  accountsWithProduct?: Account[];
  accountHeaders?: Record<string, string>;
  trialExpired?: boolean;
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
  const { isLoggedIn } = useAuth();
  const accountsResult = useRestQuery(
    'GET /v1/accounts',
    {},
    { select: (data) => data.accounts, enabled: isLoggedIn },
  );

  const accountsWithProduct = filterNonLRAccounts(accountsResult.data);
  const { data: userData } = useUser();
  const userId = userData?.id;
  const [selectedId, setSelectedId] = useState(accountIdToSelect);
  const [storedAccountIdResult, setStoredAccountId, isStorageLoaded] =
    useAsyncStorage(
      `${selectedAccountIdKey}:${userId}`,
      !!selectedAccountIdKey && !!userId,
    );
  const cache = useRestCache();

  /**
   * Initial setting of activeAccount
   */
  const activeAccount = useMemo<ActiveAccountProps>(() => {
    if (
      !userId || // require user id before reading/writing to storage
      !isStorageLoaded ||
      accountsWithProduct.length < 1 // no valid accounts found server side
    ) {
      return {};
    }

    const accountToSelect = selectedId ?? storedAccountIdResult ?? undefined;

    const selectedAccount =
      getValidAccount(accountsWithProduct, accountToSelect) ??
      accountsWithProduct[0];

    return {
      account: selectedAccount,
      accountHeaders: {
        'LifeOmic-Account': selectedAccount.id,
      },
      trialExpired: getTrialExpired(selectedAccount),
    };
  }, [
    accountsWithProduct,
    isStorageLoaded,
    selectedId,
    storedAccountIdResult,
    userId,
  ]);

  useEffect(() => {
    if (activeAccount?.account?.id) {
      setStoredAccountId(activeAccount.account.id);
    }
  }, [activeAccount?.account?.id, setStoredAccountId]);

  const setActiveAccountId = useCallback(async (accountId: string) => {
    setSelectedId(accountId);
  }, []);

  // Handle invite accept
  useEffect(() => {
    const listener = async (acceptedInvite: ProjectInvite) => {
      cache.resetQueries({ 'GET /v1/accounts': 'all' });
      setSelectedId(acceptedInvite.account);
      inviteNotifier.emit('inviteAccountSettled');
    };
    inviteNotifier.addListener('inviteAccepted', listener);
    return () => {
      inviteNotifier.removeListener('inviteAccepted', listener);
    };
  }, [cache]);

  return (
    <ActiveAccountContext.Provider
      value={{
        ...activeAccount,
        accountsWithProduct,
        setActiveAccountId,
        isLoading: accountsResult.isLoading || !isStorageLoaded,
        isFetched: accountsResult.isFetched && isStorageLoaded,
        error: accountsResult.error,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
};

export const useActiveAccount = () => useContext(ActiveAccountContext);

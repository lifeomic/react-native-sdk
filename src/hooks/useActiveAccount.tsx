import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { Account, ProjectInvite } from '../types';
import { useAsyncStorage } from './useAsyncStorage';
import { useSession } from './useSession';
import { inviteNotifier } from '../components/Invitations/InviteNotifier';

export type ActiveAccountProps = {
  account?: Account;
  accountHeaders?: Record<string, string>;
  trialExpired?: boolean;
};

export type ActiveAccountContextProps = ActiveAccountProps & {
  setActiveAccountId: (accountId: string) => Promise<void>;
  isLoading: boolean;
};

export const ActiveAccountContext = createContext({
  refetch: () => Promise.reject(),
  setActiveAccountId: () => Promise.reject(),
  isLoading: true,
  isFetched: false,
} as ActiveAccountContextProps);

const selectedAccountIdKey = 'selectedAccountId';

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
  const { isLoaded, userConfiguration, clearSession } = useSession();
  const { user, accounts } = userConfiguration;
  const [selectedId, setSelectedId] = useState(accountIdToSelect);
  const [storedAccountIdResult, setStoredAccountId, isStorageLoaded] =
    useAsyncStorage(
      `${selectedAccountIdKey}:${user.id}`,
      user.id !== 'placeholder',
    );

  /**
   * Initial setting of activeAccount
   */
  const activeAccount = useMemo<ActiveAccountProps>(() => {
    if (!isLoaded || !isStorageLoaded) {
      return {};
    }

    const accountToSelect = selectedId ?? storedAccountIdResult ?? undefined;
    const selectedAccount =
      getValidAccount(accounts, accountToSelect) ?? accounts?.[0];
    return {
      account: selectedAccount,
      accountHeaders: {
        'LifeOmic-Account': selectedAccount.id,
      },
      trialExpired: getTrialExpired(selectedAccount),
    };
  }, [accounts, isLoaded, isStorageLoaded, selectedId, storedAccountIdResult]);

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
      await setActiveAccountId(acceptedInvite.account);
      clearSession();
      inviteNotifier.emit('inviteAccountSettled');
    };
    inviteNotifier.addListener('inviteAccepted', listener);
    return () => {
      inviteNotifier.removeListener('inviteAccepted', listener);
    };
  }, [setActiveAccountId, clearSession]);

  return (
    <ActiveAccountContext.Provider
      value={{
        ...activeAccount,
        setActiveAccountId,
        isLoading: !isLoaded || !isStorageLoaded,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
};

export const useActiveAccount = () => useContext(ActiveAccountContext);

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { t } from 'lib/i18n';
import { inviteNotifier } from './InviteNotifier';
import { useAuth } from '../../hooks/useAuth';
import { useAcceptInviteMutation } from '../../hooks/useAcceptInviteMutation';

type InviteParams = {
  inviteId?: string;
  evc?: string;
};

type InviteState = {
  inviteParams: InviteParams;
  clearPendingInvite: () => Promise<void>;
};

export const InviteContext = createContext<InviteState>({
  inviteParams: {},
  clearPendingInvite: async () => Promise.reject(),
});

type ProviderProps = {
  children: React.ReactNode;
};

export const InviteProvider = ({ children }: ProviderProps) => {
  const [inviteParams, setInviteParams] = useState<InviteParams>({});
  const { isLoading, isSuccess, isError, reset, mutateAsync } =
    useAcceptInviteMutation();
  const { authResult, refreshForInviteAccept } = useAuth();

  const clearPendingInvite = useCallback(async () => {
    setInviteParams({});
    inviteNotifier.clearCache();
  }, [setInviteParams]);

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      try {
        const acceptedInvite = await mutateAsync(inviteId);

        // Before notifying others, refresh the auth token so that the new
        // auth token used has context of the accepted invite.
        await refreshForInviteAccept();
        inviteNotifier.emit('inviteAccepted', acceptedInvite);
      } catch (error) {
        if (
          (error as any)?.response?.data?.code === 'INVITATION_ALREADY_ACCEPTED'
        ) {
          console.warn('Ignoring already accepted invite');
        } else {
          console.warn('Error accepting invitation', error);
          Alert.alert(t('Error accepting invitation. Please try again.'));
        }
      } finally {
        clearPendingInvite();
        reset();
      }
    },
    [mutateAsync, refreshForInviteAccept, clearPendingInvite, reset],
  );

  // Accept invite when needed
  useEffect(() => {
    if (
      !inviteParams.inviteId ||
      !authResult?.accessToken ||
      isLoading ||
      isSuccess ||
      isError
    ) {
      return;
    }

    // An inviteId is in memory, and the user has authenticated -
    // time to accept the pending invite.
    acceptInvite(inviteParams.inviteId);
  }, [
    inviteParams.inviteId,
    authResult?.accessToken,
    isLoading,
    isSuccess,
    isError,
    acceptInvite,
  ]);

  // Listen to pending invite param notifications
  useEffect(() => {
    const listener = (pendingInviteParams: InviteParams) => {
      setInviteParams(pendingInviteParams);
    };
    inviteNotifier.addListener('inviteDetected', listener);
    return () => {
      inviteNotifier.removeListener('inviteDetected', listener);
    };
  }, []);

  return (
    <InviteContext.Provider
      value={{
        inviteParams,
        clearPendingInvite,
      }}
    >
      {children}
    </InviteContext.Provider>
  );
};
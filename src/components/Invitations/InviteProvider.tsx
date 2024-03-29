import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { t } from '../../../lib/i18n';
import { inviteNotifier } from './InviteNotifier';
import { useAuth } from '../../hooks/useAuth';
import { useRestCache, useRestMutation } from '../../hooks/rest-api';
import { ActivityIndicatorView } from '../ActivityIndicatorView';
import { useQueryClient } from '@tanstack/react-query';
import { _sdkAnalyticsEvent } from '../../common/Analytics';

export type PendingInvite = {
  inviteId: string;
  evc?: string;
};

// Intentionally *not* exporting this, to avoid exposing the underlying
// zustand implementation detail.
const usePendingInviteStore = create<PendingInvite | undefined>(
  () => undefined,
);
const usePendingInviteStateStore = create<{
  loading?: boolean;
  failedToDecode?: boolean;
  failureMessage?: string;
}>(() => ({}));

inviteNotifier.addListener('inviteDetected', (invite) => {
  _sdkAnalyticsEvent.track('InviteDetected', {}); // inviteId/evc exposure should be limited
  usePendingInviteStore.setState(invite);
  usePendingInviteStateStore.setState({
    loading: false,
    failedToDecode: false,
    failureMessage: undefined,
  });
});
inviteNotifier.addListener('inviteLoadingStateChanged', (state) => {
  usePendingInviteStateStore.setState(state, true);
});

export const usePendingInvite = () => {
  return usePendingInviteStore();
};

export const usePendingInviteState = () => {
  return usePendingInviteStateStore();
};

export const clearPendingInvite = () => {
  usePendingInviteStore.setState(undefined);
};

export type InviteProviderProps = {
  children: React.ReactNode;
};

const isInviteAlreadyAcceptedErrorResponse =
  /* istanbul ignore next */
  (response: unknown): boolean => {
    if (!response) {
      return false;
    }

    if (typeof response !== 'object') {
      return false;
    }

    if ('code' in response && response.code === 'INVITATION_ALREADY_ACCEPTED') {
      return true;
    }

    if (
      'error' in response &&
      typeof response.error === 'string' &&
      response.error.includes('already accepted')
    ) {
      return true;
    }

    return false;
  };

export const InviteProvider: React.FC<InviteProviderProps> = ({ children }) => {
  const pendingInvite = usePendingInvite();
  const { refreshForInviteAccept } = useAuth();
  const cache = useRestCache();
  const queryClient = useQueryClient();

  const mutation = useRestMutation('PATCH /v1/invitations/:inviteId', {
    // Do not include account header on this request.
    axios: { headers: { 'LifeOmic-Account': '' } },
    onError: (error: any) => {
      if (isInviteAlreadyAcceptedErrorResponse(error.response?.data)) {
        console.warn('Ignoring already accepted invite');
        _sdkAnalyticsEvent.track('InviteAcceptFailure', {
          reason: 'Invite Already Accepted',
        });
      } else {
        console.warn('Error accepting invitation', error);
        Alert.alert(t('Error accepting invitation. Please try again.'));
        _sdkAnalyticsEvent.track('InviteAcceptFailure', {
          reason: JSON.stringify(error),
        });
      }
      clearPendingInvite();
      mutation.reset();
    },
    onSuccess: async (acceptedInvite) => {
      _sdkAnalyticsEvent.track('InviteAcceptSuccess', {
        accountName: acceptedInvite.accountName,
        accountId: acceptedInvite.account,
      });

      // Add the new account to the account list.
      cache.updateCache(
        'GET /v1/accounts',
        {},
        {
          accounts: [
            {
              id: acceptedInvite.account,
              name: acceptedInvite.accountName,
              type: 'PAID',
              logo: undefined,
              features: [],
              products: [],
              trialActive: false,
              trialEndDate: undefined,
            },
          ],
        },
      );

      // Before notifying others, refresh the auth token so that the new
      // auth token used has context of the accepted invite.
      await refreshForInviteAccept();
      // Clear the query client. Many API queries might return new data now that the
      // invitation has been accepted. This is especially important for apps that might
      // use multiple projects.
      queryClient.clear();
      clearPendingInvite();
      mutation.reset();
    },
  });

  useEffect(() => {
    if (pendingInvite && mutation.status === 'idle') {
      mutation.mutate({
        inviteId: pendingInvite.inviteId,
        status: 'ACCEPTED',
      });
    }
  }, [pendingInvite, mutation]);

  // If there is a pending invite, assume we are in the process of accepting it.
  if (pendingInvite) {
    return (
      <ActivityIndicatorView
        message={t('root-stack-accepting-invitation', 'Accepting invitation')}
      />
    );
  }

  return <>{children}</>;
};

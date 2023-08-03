import { getBundleId } from 'react-native-device-info';
import {
  SyncTypeSettings,
  ToggleWearableResult,
  WearableIntegrationFailureCode,
  WearableIntegrationStatus,
  WearablesSyncState,
} from '../components/Wearables/WearableTypes';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { useAuthenticatedQuery } from './useAuth';

/**
 *
 * @returns UTC offset in ±HHMM format, e.g., -04:00 for New York City during daylight saving time
 * or -05:00 during standard time. Equivalent to moment's utcOffset() function.
 */
const getUTCOffset = () => {
  const offsetInMinutes = new Date().getTimezoneOffset();
  const sign = offsetInMinutes > 0 ? '-' : '+';
  const hours = Math.abs(Math.floor(offsetInMinutes / 60))
    .toString()
    .padStart(2, '0');
  const minutes = Math.abs(offsetInMinutes % 60)
    .toString()
    .padStart(2, '0');
  const offset = `${sign}${hours}${minutes}`;
  return offset;
};

interface SetLastSync {
  ehrId: string;
  lastSync: string;
  failureCode?: WearableIntegrationFailureCode;
}

interface SetWearableState {
  ehrId: string;
  enabled: boolean;
  meta?: {
    syncBeginTimestamp?: string;
    appId?: string;
    region?: string;
  };
}

export const useWearables = () => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();

  const setWearableState = async ({
    ehrId,
    enabled,
    meta,
  }: SetWearableState) => {
    const metaToSend = enabled
      ? {
          syncBeginTimestamp: new Date().toISOString(),
          timezoneOffset: getUTCOffset(),
          ...meta,
        }
      : meta;

    return httpClient
      .patch<ToggleWearableResult>(
        `/v1/wearables/${ehrId}`,
        {
          enabled,
          meta: metaToSend,
        },
        { headers: accountHeaders },
      )
      .then((res) => res.data);
  };

  const setLastSync = async ({ ehrId, lastSync, failureCode }: SetLastSync) =>
    httpClient.patch(
      `/v1/wearables/${ehrId}`,
      {
        lastSync,
        status: failureCode
          ? WearableIntegrationStatus.Failure
          : WearableIntegrationStatus.Syncing,
        failureCode,
      },
      { headers: accountHeaders },
    );

  const setSyncTypes = async (settings: SyncTypeSettings) =>
    httpClient.put('/v1/wearables/sync-types', settings, {
      headers: accountHeaders,
    });

  const useWearableIntegrationQuery = (ehrId: string) =>
    useAuthenticatedQuery(
      'get-wearable',
      (client) =>
        client.get(`/v1/wearables/${ehrId}`, { headers: accountHeaders }),
      {
        enabled: !!accountHeaders,
      },
    );

  const useWearableIntegrationsQuery = () =>
    useAuthenticatedQuery(
      'get-wearables',
      (client) =>
        client
          .get<WearablesSyncState>('/v1/wearables', {
            params: { appId: getBundleId().toLowerCase() },
            headers: accountHeaders,
          })
          .then((res) => res.data),
      {
        enabled: !!accountHeaders,
      },
    );

  return {
    setWearableState,
    setSyncTypes,
    setLastSync,
    useWearableIntegrationQuery,
    useWearableIntegrationsQuery,
  };
};

import { useQuery } from 'react-query';
import {
  SyncTypeSettings,
  ToggleWearableResult,
  WearableIntegrationFailureCode,
  WearableIntegrationStatus,
  WearablesSyncState,
} from '../components/Wearables/WearableTypes';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';

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

export const useWearableIntegrations = (appId: string) => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  return useQuery('/v1/wearables', () =>
    httpClient
      .get<WearablesSyncState>('/v1/wearables', {
        params: { appId },
        headers: accountHeaders,
      })
      .then((res) => res.data),
  );
};

export const useWearableIntegration = (ehrId: string) => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  return useQuery('/v1/wearables/{ehrId}', () => {
    httpClient.get(`/v1/wearables/${ehrId}`, { headers: accountHeaders });
  });
};

export const useSetSyncTypes = () => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  const setSyncTypes = (settings: SyncTypeSettings) =>
    httpClient.put('/v1/wearables/sync-types', settings, {
      headers: accountHeaders,
    });
  return setSyncTypes;
};

export const useSetLastSync = () => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  const setLastSync = async (
    ehrId: string,
    lastSync: string,
    failureCode?: WearableIntegrationFailureCode,
  ) => {
    return httpClient.patch(
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
  };

  return setLastSync;
};

export const useSetWearableState = () => {
  const { httpClient } = useHttpClient();
  const { accountHeaders } = useActiveAccount();
  const setWearableState = async (
    ehrId: string,
    enabled: boolean,
    meta?: any,
  ) => {
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

  return setWearableState;
};

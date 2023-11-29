import { getBundleId } from 'react-native-device-info';
import { useQuery } from '@tanstack/react-query';
import {
  SyncTypeSettings,
  ToggleWearableResult,
  WearableIntegrationFailureCode,
  WearableIntegrationStatus,
  WearablesSyncState,
} from '../components/Wearables/WearableTypes';
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
      .patch<ToggleWearableResult>(`/v1/wearables/${ehrId}`, {
        enabled,
        meta: metaToSend,
      })
      .then((res) => res.data);
  };

  const setLastSync = async ({ ehrId, lastSync, failureCode }: SetLastSync) =>
    httpClient.patch(`/v1/wearables/${ehrId}`, {
      lastSync,
      status: failureCode
        ? WearableIntegrationStatus.Failure
        : WearableIntegrationStatus.Syncing,
      failureCode,
    });

  const setSyncTypes = async (settings: SyncTypeSettings) =>
    httpClient.put('/v1/wearables/sync-types', settings);

  const useWearableIntegrationQuery = (ehrId: string) =>
    useQuery(['get-wearable'], () => httpClient.get(`/v1/wearables/${ehrId}`));

  const useWearableIntegrationsQuery = () =>
    useQuery(['get-wearables'], () =>
      httpClient
        .get<WearablesSyncState>('/v1/wearables', {
          params: { appId: getBundleId().toLowerCase() },
        })
        .then((res) => res.data),
    );

  return {
    setWearableState,
    setSyncTypes,
    setLastSync,
    useWearableIntegrationQuery,
    useWearableIntegrationsQuery,
  };
};

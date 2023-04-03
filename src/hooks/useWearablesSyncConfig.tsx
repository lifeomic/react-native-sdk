import { useQuery } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useMe } from './useMe';
import { useHttpClient } from './useHttpClient';

import { AxiosInstance } from 'axios';
// import moment from 'moment';
import _get from 'lodash/get';
import {
  SyncTypeSettings,
  ToggleWearableResult,
  WearableIntegration,
  WearableIntegrationConfig,
  WearableIntegrationFailureCode,
  WearableIntegrationStatus,
} from '../components/Wearables/WearableTypes';

export interface WearablesSyncConfigCtorOptions {
  axios: AxiosInstance;
}
export interface WearableIntegrationList {
  items: WearableIntegration[];
}
/**
 * This class abstracts the wearables API and any munging of the
 * data we need to do before/after requests.
 */
export class WearablesSyncConfig {
  axios: AxiosInstance;

  constructor(options: WearablesSyncConfigCtorOptions) {
    this.axios = options.axios;
  }

  getV1Endpoint(axios: AxiosInstance, endpoint: string): string {
    if (_get(axios, 'defaults.baseURL', '').endsWith('/v1')) {
      return endpoint.replace('/v1', '');
    }
    return endpoint;
  }

  async getWearableIntegrations(
    config?: WearableIntegrationConfig,
  ): Promise<WearableIntegrationList> {
    try {
      const endpoint = this.getV1Endpoint(this.axios, '/v1/wearables');
      const include = _get(config, 'include', []).join(',');
      const appId = _get(config, 'appId');
      const appVersionNumber = _get(config, 'appVersionNumber');
      const result = await this.axios.get(endpoint, {
        params: { include, appId, appVersionNumber },
      });
      if (result.status !== 200) {
        throw new Error(
          `Unexpected status code from wearables fetch: ${result.status}`,
        );
      }
      const items = _get(result, 'data.items', []);

      // Returning an object here just for the possibility
      // of additional props down the road.
      return {
        items: items.map((item: WearableIntegration) => ({
          ehrId: item.ehrId,
          ehrType: item.ehrType,
          name: item.name,
          enabled: item.enabled,
          status: item.status,
          lastSync: item.lastSync,
          meta: item.meta,
          supportedSyncTypes: item.supportedSyncTypes,
          syncTypes: item.syncTypes,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  async getWearableIntegration(ehrId: string): Promise<WearableIntegration> {
    try {
      const endpoint = this.getV1Endpoint(this.axios, `/v1/wearables/${ehrId}`);
      const result = await this.axios.get(endpoint);
      if (result.status !== 200) {
        throw new Error(
          `Unexpected status code from wearables fetch: ${result.status}`,
        );
      }
      return result.data;
    } catch (error) {
      throw error;
    }
  }
  async toggleWearableIntegration(
    ehrId: string,
    enabled: boolean,
    meta?: any,
  ): Promise<ToggleWearableResult> {
    try {
      const metaToSend = enabled
        ? {
            syncBeginTimestamp: new Date().toISOString(),
            timezoneOffset: moment().utcOffset(),
            ...meta,
          }
        : meta;
      const endpoint = this.getV1Endpoint(this.axios, `/v1/wearables/${ehrId}`);
      const result = await this.axios.patch(endpoint, {
        enabled,
        meta: metaToSend,
      });
      if (result.status !== 200 && result.status !== 204) {
        throw new Error(
          `Unexpected status code from toggling wearable: ${result.status}`,
        );
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  async setLastSync(
    ehrId: string,
    lastSync: string,
    failureCode?: WearableIntegrationFailureCode,
  ): Promise<WearableIntegration> {
    try {
      const endpoint = this.getV1Endpoint(this.axios, `/v1/wearables/${ehrId}`);
      const result = await this.axios.patch(endpoint, {
        lastSync,
        status: failureCode
          ? WearableIntegrationStatus.Failure
          : WearableIntegrationStatus.Syncing,
        failureCode,
      });
      if (result.status !== 200) {
        throw new Error(
          `Unexpected status code from wearables fetch: ${result.status}`,
        );
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  async setSyncTypes(settings: SyncTypeSettings): Promise<WearableIntegration> {
    try {
      const endpoint = this.getV1Endpoint(
        this.axios,
        '/v1/wearables/sync-types',
      );
      const result = await this.axios.put(endpoint, settings);
      if (result.status !== 200) {
        throw new Error(
          `Unexpected status code from wearables fetch: ${result.status}`,
        );
      }

      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

export function useWearablesSyncConfig() {
  const { account, accountHeaders } = useActiveAccount();
  const { data: subjects } = useMe();
  const { httpClient } = useHttpClient();

  return useQuery(
    `${account?.id}-projects`,
    () =>
      httpClient
        .get<ProjectsResponse>(
          `/v1/projects?id=${subjects?.map((s) => s.projectId).join(',')}`,
          { headers: accountHeaders },
        )
        .then((res) => res.data.items),
    {
      enabled:
        !!accountHeaders &&
        (subjects?.length ?? 0) > 0 &&
        !!subjects?.every((s) => s.projectId),
    },
  );
}

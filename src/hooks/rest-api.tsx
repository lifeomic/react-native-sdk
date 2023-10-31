import { createAPIHooks } from '@lifeomic/one-query';
import axios from 'axios';
import { RestAPIEndpoints } from '../types/rest-types';
import { useActiveAccount } from './useActiveAccount';
import { useAuth } from './useAuth';
import { useDeveloperConfig } from './useDeveloperConfig';

/**
 * **IMPORTANT**: you should almost certainly not be using this.
 *
 * Instead, use the `useRestXXXX` hooks.
 */
export const _useAxiosAPIClient = (account: string | undefined) => {
  const { apiBaseURL } = useDeveloperConfig();
  const auth = useAuth();

  if (!apiBaseURL) {
    throw new Error('No base URL specified.');
  }

  const accessToken = auth.authResult?.accessToken;
  if (!accessToken) {
    throw new Error('No access token found.');
  }

  const client = axios.create({ baseURL: apiBaseURL });

  client.interceptors.request.use(async (config) => {
    config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers['LifeOmic-Account'] = account;
    return config;
  });

  return client;
};

const hooks = createAPIHooks<RestAPIEndpoints>({
  name: 'lifeomic-react-native-sdk',
  client: () => {
    const activeAccount = useActiveAccount();

    const account = activeAccount.account?.id;
    if (!account) {
      throw new Error('No active account found.');
    }

    const client = _useAxiosAPIClient(account);

    return client;
  },
});

export const useRestQuery = hooks.useAPIQuery;

export const useRestInfiniteQuery = hooks.useInfiniteAPIQuery;

export const useRestCombinedQueries = hooks.useCombinedAPIQueries;

export const useRestMutation = hooks.useAPIMutation;

export const useRestCache = hooks.useAPICache;

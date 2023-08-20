import { createAPIHooks } from '@lifeomic/one-query';
import { useHttpClient } from './useHttpClient';
import { RestAPIEndpoints } from '../types/rest-types';

const hooks = createAPIHooks<RestAPIEndpoints>({
  name: 'lifeomic-react-native-sdk',
  client: () => {
    const { httpClient } = useHttpClient();
    return httpClient;
  },
});

export const useRestQuery = hooks.useAPIQuery;

export const useInfiniteRestQuery = hooks.useInfiniteAPIQuery;

export const useCombinedRestQueries = hooks.useCombinedAPIQueries;

export const useRestMutation = hooks.useAPIMutation;

export const useRestCache = hooks.useAPICache;

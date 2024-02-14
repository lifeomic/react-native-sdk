import {
  createRestAPIHooks,
  RestAPIEndpoints as ClientRestAPIEndpoints,
} from '@lifeomic/react-client';
import { useHttpClient } from './useHttpClient';
import { RestAPIEndpoints } from '../types/rest-types';
import { APIQueryHooks } from '@lifeomic/one-query';

const hooks: APIQueryHooks<RestAPIEndpoints & ClientRestAPIEndpoints> =
  createRestAPIHooks<RestAPIEndpoints>({
    name: 'lifeomic-react-native-sdk',
    client: () => {
      // This function is explicitly documented as being hooks-compatible.
      //
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { httpClient } = useHttpClient();
      return httpClient;
    },
  });

export const useRestQuery = hooks.useAPIQuery;

export const useInfiniteRestQuery = hooks.useInfiniteAPIQuery;

export const useCombinedRestQueries = hooks.useCombinedAPIQueries;

export const useRestMutation = hooks.useAPIMutation;

export const useRestCache = hooks.useAPICache;

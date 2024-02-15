import {
  createRestAPIHooks,
  RestAPIEndpoints as ClientRestAPIEndpoints,
} from '@lifeomic/react-client';
import { useHttpClient } from './useHttpClient';
import { RestAPIEndpoints } from '../types/rest-types';
import { APIQueryHooks, RequestPayloadOf } from '@lifeomic/one-query';
import {
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query/build/lib/types';
import { AxiosRequestConfig } from 'axios';

type Endpoints = RestAPIEndpoints & ClientRestAPIEndpoints;

declare type RestrictedUseQueryOptions<
  Response,
  TError = unknown,
  Data = Response,
> = Omit<UseQueryOptions<Response, TError, Data>, 'queryKey' | 'queryFn'> & {
  axios?: AxiosRequestConfig;
};

const hooks: APIQueryHooks<Endpoints> = createRestAPIHooks<Endpoints>({
  name: 'lifeomic-react-native-sdk',
  client: () => {
    // This function is explicitly documented as being hooks-compatible.
    //
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { httpClient } = useHttpClient();
    return httpClient;
  },
});

export const useRestQuery: <
  Route extends keyof Endpoints & string,
  Data = Endpoints[Route]['Response'],
>(
  route: Route,
  payload: RequestPayloadOf<Endpoints, Route>,
  options?: RestrictedUseQueryOptions<
    Endpoints[Route]['Response'],
    unknown,
    Data
  >,
) => UseQueryResult<Data> = hooks.useAPIQuery;

export const useInfiniteRestQuery = hooks.useInfiniteAPIQuery;

export const useCombinedRestQueries = hooks.useCombinedAPIQueries;

export const useRestMutation = hooks.useAPIMutation;

export const useRestCache = hooks.useAPICache;

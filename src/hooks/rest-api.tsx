import { createRestAPIHooks, RestAPIEndpoints } from '@lifeomic/react-client';
import { useHttpClient } from './useHttpClient';
import { AppConfig } from './useAppConfig';
import { APIQueryHooks, RequestPayloadOf } from '@lifeomic/one-query';
import {
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query/build/lib/types';
import { AxiosRequestConfig } from 'axios';

export type Overrides = {
  'GET /v1/life-research/projects/:projectId/app-config': {
    Request: {};
    Response: AppConfig;
  };
};

declare type RestrictedUseQueryOptions<
  Response,
  TError = unknown,
  Data = Response,
> = Omit<UseQueryOptions<Response, TError, Data>, 'queryKey' | 'queryFn'> & {
  axios?: AxiosRequestConfig;
};

export type Endpoints = RestAPIEndpoints & Overrides;

const hooks: APIQueryHooks<Endpoints> = createRestAPIHooks<Overrides>({
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

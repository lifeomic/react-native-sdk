import React, { createContext, useContext, useMemo } from 'react';
import axios, {
  AxiosError,
  AxiosInstance,
  RawAxiosRequestHeaders,
} from 'axios';
import { useAuth } from './useAuth';
import { APIClient } from '@lifeomic/one-query';
import { useActiveAccount } from './useActiveAccount';
import { RestAPIEndpoints } from '@lifeomic/react-client';

export const defaultBaseURL = 'https://api.us.lifeomic.com';
export const defaultHeaders: RawAxiosRequestHeaders = {
  'Content-Type': 'application/json',
};

export const defaultAxiosInstance = axios.create({
  baseURL: defaultBaseURL,
  headers: defaultHeaders,
});

export const defaultAPIClientInstance = new APIClient<RestAPIEndpoints>(
  defaultAxiosInstance,
);

export interface HttpClient {
  httpClient: AxiosInstance;
  apiClient: APIClient<RestAPIEndpoints>;
}

const HttpClientContext = createContext<HttpClient>({
  httpClient: defaultAxiosInstance,
  apiClient: defaultAPIClientInstance,
});

let requestInterceptorId: number;
let responseInterceptorId: number;

/* istanbul ignore next */
const createHumanReadableFailureMessage = (error: AxiosError) => {
  const lines: string[] = ['HTTP Request Failed:'];

  if (!error.config) {
    lines.push('  No request config found.');
    return lines.join('\n');
  }

  const method = error.config.method?.toUpperCase() ?? '<unknown method>';
  const baseUrl = error.config.baseURL ?? '<unknown base url>';
  const url = error.config.url ?? '<unknown url>';

  const status = error.response?.status ?? '<unknown>';

  const data = error.response?.data
    ? JSON.stringify(error.response.data, null, 2)
    : '<no response data>';

  lines.push(`  Endpoint: ${method} ${baseUrl}${url}`);
  lines.push(`  Response Status: ${status}`);
  lines.push(`  Response Data: ${data}`);

  return lines.join('\n');
};

/**
 * The HttpClientContextProvider's job is to provide an HTTP client that
 * takes care of things like managing the HTTP Authorization header, error
 * response handling, and other default behavior.
 */
export const HttpClientContextProvider = ({
  injectedAxiosInstance,
  baseURL,
  children,
}: {
  injectedAxiosInstance?: AxiosInstance;
  baseURL?: string;
  children?: React.ReactNode;
}) => {
  const { account } = useActiveAccount();
  const { authResult, refreshForAuthFailure } = useAuth();

  const axiosInstance = injectedAxiosInstance || defaultAxiosInstance;
  const apiClient = defaultAPIClientInstance;

  if (baseURL || !axiosInstance.defaults.baseURL) {
    axiosInstance.defaults.baseURL = baseURL || defaultBaseURL;
  }

  const httpClient = useMemo(() => {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
    axiosInstance.interceptors.response.eject(responseInterceptorId);
    if (!authResult?.accessToken) {
      return axiosInstance;
    }

    requestInterceptorId = axiosInstance.interceptors.request.use((config) => {
      // Add active account as LifeOmic-Account header.
      // Allow for an empty string to be passed to "clear" the header.
      if (config.headers['LifeOmic-Account'] === '') {
        delete config.headers['LifeOmic-Account'];
      } else {
        config.headers['LifeOmic-Account'] = account;
      }

      // Add current access token as auth header
      config.headers.Authorization = `Bearer ${authResult.accessToken}`;
      return config;
    });

    // Detect 401s and ask for refresh
    responseInterceptorId = axiosInstance.interceptors.response.use(
      undefined,
      async function (error: Error) {
        if (axios.isAxiosError(error)) {
          if (__DEV__ && process.env.NODE_ENV !== 'test') {
            console.log(createHumanReadableFailureMessage(error));
            console.warn(
              'An HTTP request failed. See the Metro logs for details.',
            );
          }

          if (error.response?.status === 401) {
            await refreshForAuthFailure(error);
          }
        }

        return Promise.reject(error);
      },
    );

    return axiosInstance;
  }, [authResult?.accessToken, axiosInstance, account, refreshForAuthFailure]);

  const context: HttpClient = { httpClient, apiClient };

  return (
    <HttpClientContext.Provider value={context}>
      {children}
    </HttpClientContext.Provider>
  );
};

export const useHttpClient = () => useContext(HttpClientContext);

import React, { createContext, useContext, useMemo } from 'react';
import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios';
import { useAuth } from './useAuth';

export const defaultBaseURL = 'https://api.us.lifeomic.com';
export const defaultHeaders: RawAxiosRequestHeaders = {
  'Content-Type': 'application/json',
};

export const defaultAxiosInstance = axios.create({
  baseURL: defaultBaseURL,
  headers: defaultHeaders,
});

export interface HttpClient {
  httpClient: AxiosInstance;
}

const HttpClientContext = createContext<HttpClient>({
  httpClient: defaultAxiosInstance,
});

let requestInterceptorId: number;
let responseInterceptorId: number;

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
  const { authResult, refreshForAuthFailure } = useAuth();

  const axiosInstance = injectedAxiosInstance || defaultAxiosInstance;

  if (baseURL || !axiosInstance.defaults.baseURL) {
    axiosInstance.defaults.baseURL = baseURL || defaultBaseURL;
  }

  const httpClient = useMemo(() => {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
    axiosInstance.interceptors.response.eject(responseInterceptorId);
    if (!authResult?.accessToken) {
      return axiosInstance;
    }

    // Add current access token as auth header
    requestInterceptorId = axiosInstance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${authResult.accessToken}`;
      return config;
    });

    // Detect 401s and ask for refresh
    responseInterceptorId = axiosInstance.interceptors.response.use(
      undefined,
      async function (error: Error) {
        if (axios.isAxiosError(error)) {
          if (__DEV__ && process.env.NODE_ENV !== 'test') {
            console.warn('Request Failed: ', error.toJSON());
          }

          if (error.response?.status === 401) {
            await refreshForAuthFailure(error);
          }
        }

        return Promise.reject(error);
      },
    );

    return axiosInstance;
  }, [authResult?.accessToken, axiosInstance, refreshForAuthFailure]);

  const context: HttpClient = { httpClient };

  return (
    <HttpClientContext.Provider value={context}>
      {children}
    </HttpClientContext.Provider>
  );
};

export const useHttpClient = () => useContext(HttpClientContext);

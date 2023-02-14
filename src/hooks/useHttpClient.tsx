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

let interceptorId: number;

/**
 * The HttpClientContextProvider's job is to provide an HTTP client that
 * takes care of things like managing the HTTP Authorization header and
 * other default behavior.
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
  const { authResult } = useAuth();

  const axiosInstance = injectedAxiosInstance || defaultAxiosInstance;

  if (baseURL || !axiosInstance.defaults.baseURL) {
    axiosInstance.defaults.baseURL = baseURL || defaultBaseURL;
  }

  const httpClient = useMemo(() => {
    axiosInstance.interceptors.request.eject(interceptorId);
    if (!authResult?.accessToken) {
      return axiosInstance;
    }
    interceptorId = axiosInstance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${authResult.accessToken}`;
      return config;
    });
    return axiosInstance;
  }, [authResult?.accessToken, axiosInstance]);

  const context: HttpClient = { httpClient };

  return (
    <HttpClientContext.Provider value={context}>
      {children}
    </HttpClientContext.Provider>
  );
};

export const useHttpClient = () => useContext(HttpClientContext);

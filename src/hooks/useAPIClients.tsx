import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './useAuth';
import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios';

export const defaultBaseURL = 'https://api.us.lifeomic.com';
export const defaultHeaders: RawAxiosRequestHeaders = {
  'Content-Type': 'application/json',
};
const axiosInstance = axios.create({
  baseURL: defaultBaseURL,
  headers: defaultHeaders,
});

export interface APIClients {
  httpClient: AxiosInstance;
}

const APIClientsContext = createContext<APIClients>({
  httpClient: axiosInstance,
});

let interceptorId: number;

/**
 * The APIClientsContextProvider's job is to provide API clients (such as an
 * HTTP client and/or graphql client) that takes care of things like managing
 * the HTTP Authorization header and other default behavior.
 */
export const APIClientsContextProvider = ({
  baseURL,
  children,
}: {
  baseURL?: string;
  children?: React.ReactNode;
}) => {
  const { authResult } = useAuth();

  if (baseURL) {
    axiosInstance.defaults.baseURL = baseURL;
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
  }, [authResult?.accessToken]);

  const context: APIClients = {
    httpClient,
  };

  return (
    <APIClientsContext.Provider value={context}>
      {children}
    </APIClientsContext.Provider>
  );
};

export const useAPIClients = () => useContext(APIClientsContext);

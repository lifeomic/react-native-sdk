import React from 'react';
import axios, { AxiosInstance } from 'axios';
import { RestAPIEndpoints } from '../types/rest-types';
import { useQuery } from '@tanstack/react-query';
import { APIClient } from '@lifeomic/one-query';

export type CoreAuthProviderProps = {
  loading: React.ReactNode;
  baseURL: string;
  children: React.ReactNode;
  /**
   * Overrides the active account setting.
   */
  accountOverride?: string;
};

type CoreAuthContextValue = {
  baseURL: string;
  account: string;
};

const _Context = React.createContext<CoreAuthContextValue | undefined>(
  undefined,
);

const getAccessToken = async (): Promise<string> => '';

export const CoreAuthProvider: React.FC<CoreAuthProviderProps> = ({
  loading,
  baseURL,
  children,
  accountOverride,
}) => {
  // 1. First, determine the active account.
  const query = useQuery(['accounts'], async () => {
    const token = await getAccessToken();
    const client = new APIClient<RestAPIEndpoints>(
      axios.create({
        baseURL,
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    const result = await client.request('GET /v1/accounts', {});
    const activeAccount = result.data.accounts[0].id;
    return activeAccount;
  });

  if (query.status !== 'success') {
    return loading;
  }

  return (
    <_Context.Provider value={{ account: query.data, baseURL }}>
      {children}
    </_Context.Provider>
  );
};

export type UseCoreAuthContextReturn = {
  activeAccount: string;
  /**
   * A client, authenticated with a bearer token and the LifeOmic-Account header.
   */
  client: AxiosInstance;
};

export const useCoreAuthContext = (): UseCoreAuthContextReturn => {
  const value = React.useContext(_Context);
  if (!value) {
    throw new Error('Called useCoreAuthContext outside of CoreAuthProvider');
  }

  const client = axios.create({
    baseURL: value.baseURL,
    headers: { 'LifeOmic-Account': value.account },
  });

  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(undefined, async function (error: Error) {
    if (axios.isAxiosError(error)) {
      if (__DEV__ && process.env.NODE_ENV !== 'test') {
        console.warn('Request Failed: ', error.toJSON());
      }
    }

    return Promise.reject(error);
  });

  return {
    activeAccount: value.account,
    client,
  };
};

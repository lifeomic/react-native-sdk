import React from 'react';
import axios, { AxiosInstance } from 'axios';
import { useActiveAccount } from './useActiveAccount';
import { useAuth } from './useAuth';
import { useHttpClient } from './useHttpClient';

export type AccountClient = {
  /**
   * An Axios instance that is authenticated to the LifeOmic REST API.
   *
   * This client has a built-in access token and `LifeOmic-Account` header.
   */
  http: AxiosInstance;
};

const _Context = React.createContext<AccountClient | undefined>(undefined);

export type AccountClientProviderProps = {
  /** A UI to show while the minimum data is loading. */
  loading: React.ReactElement;

  children: React.ReactNode;
};

export const AccountClientProvider: React.FC<AccountClientProviderProps> = ({
  loading,
  children,
}) => {
  const auth = useAuth();
  const baseClient = useHttpClient();
  const { account } = useActiveAccount();

  // Memoizing this context value is worthwhile because this provider will be
  // used relatively high up in the component tree.
  const context = React.useMemo(() => {
    if (!auth.authResult?.accessToken || !account?.id) {
      return undefined;
    }

    const client = axios.create({
      baseURL: baseClient.httpClient.defaults.baseURL,
      headers: {
        Authorization: `Bearer ${auth.authResult.accessToken}`,
        'LifeOmic-Account': account.id,
      },
    });

    client.interceptors.request.use((config) => {
      // Support "unsetting" the LifeOmic-Account header with ''
      if (config.headers['LifeOmic-Account'] === '') {
        delete config.headers['LifeOmic-Account'];
      }

      // TODO: support refreshing an expired token mid-flight to keep requests moving.

      return config;
    });

    client.interceptors.response.use((error) => {
      if (axios.isAxiosError(error)) {
        if (__DEV__ && process.env.NODE_ENV !== 'test') {
          console.error('Request Failed: ', error.toJSON());
        }
      }
      return Promise.reject(error);
    });

    return { http: client };
  }, [
    baseClient.httpClient.defaults.baseURL,
    auth.authResult?.accessToken,
    account?.id,
  ]);

  if (!context) {
    return loading;
  }

  return <_Context.Provider value={context}>{children}</_Context.Provider>;
};

export const useAccountClient = (): AccountClient => {
  const context = React.useContext(_Context);
  if (!context) {
    throw new Error(
      'useAccountClient must be used within a AccountClientProvider',
    );
  }
  return context;
};

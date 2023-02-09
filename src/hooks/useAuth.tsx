import React, { createContext, useCallback, useContext, useState } from 'react';
import { RefreshResult } from 'react-native-app-auth';
import { SecureStore } from '../common/SecureStore';

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  authResult?: AuthResult;
  storeAuthResult: (params: AuthResult) => Promise<void>;
  clearAuthResult: () => Promise<void>;
  initialize: () => Promise<void>;
}

export type AuthResult = Omit<RefreshResult, 'additionalParameters'>;

const AuthContext = createContext<AuthStatus>({
  loading: true,
  isLoggedIn: false,
  storeAuthResult: (_) => Promise.reject(),
  clearAuthResult: () => Promise.reject(),
  initialize: () => Promise.reject(),
});

const secureStorage = new SecureStore<AuthResult>('auth-hook');

export const AuthContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [authResult, setAuthResult] = useState<AuthResult>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const storeAuthResult = useCallback(async (result: AuthResult) => {
    await secureStorage.setObject(result);
    setAuthResult(result);
    setIsLoggedIn(true);
    setLoading(false);
  }, []);

  const clearAuthResult = useCallback(async () => {
    await secureStorage.clear();
    setAuthResult(undefined);
    setIsLoggedIn(false);
    setLoading(false);
  }, []);

  const initialize = useCallback(async () => {
    try {
      const storedResult = await secureStorage.getObject();
      if (storedResult) {
        const fifteenMinInMs = 15 * 60 * 1000;
        if (
          new Date(storedResult.accessTokenExpirationDate).getTime() >
          new Date().getTime() + fifteenMinInMs
        ) {
          setAuthResult(storedResult);
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.warn(error, 'Error occurred loading auth token');
    }
    setLoading(false);
  }, []);

  const context = {
    loading,
    isLoggedIn,
    authResult,
    storeAuthResult,
    clearAuthResult,
    initialize,
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

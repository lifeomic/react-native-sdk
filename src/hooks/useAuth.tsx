import React, { createContext, useCallback, useContext, useState } from 'react';
import { RefreshResult } from 'react-native-app-auth';
import { SecureStore } from '../common/SecureStore';

export interface AuthStatus {
  loading: boolean;
  isLoggedIn: boolean;
  authResult?: AuthResult;
  storeAuthResult: (params: AuthResult) => Promise<void>;
  clearAuthResult: () => Promise<void>;
}

export type AuthResult = Omit<RefreshResult, 'additionalParameters'>;

const AuthContext = createContext<AuthStatus>({
  loading: true,
  isLoggedIn: false,
  storeAuthResult: (_) => Promise.reject(),
  clearAuthResult: () => Promise.reject(),
});

const secureStorage = new SecureStore<AuthResult>('auth-hook');

export const AuthContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [authResult, setAuthResult] = useState<AuthResult>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const storeAuthResult = useCallback(async (result: AuthResult) => {
    await secureStorage.setObject('auth-result', result);
    setAuthResult(result);
    setIsLoggedIn(true);
  }, []);

  const clearAuthResult = useCallback(async () => {
    await secureStorage.clear();
    setAuthResult(undefined);
    setIsLoggedIn(false);
  }, []);

  const context = {
    loading: true,
    isLoggedIn,
    authResult,
    storeAuthResult,
    clearAuthResult,
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

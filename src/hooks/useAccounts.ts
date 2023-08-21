import { useQuery } from '@tanstack/react-query';
import { useHttpClient } from './useHttpClient';
import { useAuth } from './useAuth';

export interface Account {
  id: string;
  name: string;
  type: string;
  description: string;
  logo: string;
  products: string[];
  features: string[];
  trialActive: boolean;
  trialEndDate: string;
}

interface AccountsResponse {
  accounts: Account[];
}

export function useAccounts() {
  const { authResult } = useAuth();
  const { httpClient } = useHttpClient();

  return useQuery(
    ['accounts'],
    () =>
      httpClient
        .get<AccountsResponse>('/v1/accounts')
        .then((res) => res.data.accounts),
    {
      enabled: !!authResult?.accessToken,
    },
  );
}

import { useAuthenticatedQuery } from './useAuth';

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
  return useAuthenticatedQuery('accounts', (client) =>
    client
      .get<AccountsResponse>('/v1/accounts')
      .then((res) => res.data.accounts),
  );
}

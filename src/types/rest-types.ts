import { ProjectInvite, User } from '../types';

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

/**
 * This type definition describes known endpoints in our REST API.
 *
 * It is structured in the format specified by [one-query](https://github.com/lifeomic/one-query).
 */
export type RestAPIEndpoints = {
  'GET /v1/accounts': {
    Request: {};
    Response: {
      accounts: Account[];
    };
  };

  'PATCH /v1/invitations/:inviteId': {
    Request: { status: 'ACCEPTED' };
    Response: ProjectInvite;
  };

  'PATCH /v1/user': {
    Request: { profile: Omit<User['profile'], 'picture' | 'email'> };
    Response: User;
  };
};

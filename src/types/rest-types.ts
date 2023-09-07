import { ConsentDirective, SurveyResponse } from '../hooks/todayTile/types';
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

  'GET /v1/survey/projects/:projectId/responses': {
    Request: {
      patientId: string;
      author: string;
      includeSurveyName: boolean;
      pageSize: number;
      status: string;
      nextPageToken?: string;
    };
    Response: {
      items: SurveyResponse[];
      nextPageToken?: string;
    };
  };

  'GET /v1/consent/directives/me': {
    Request: {
      projectId: string;
      includeForm: boolean;
    };
    Response: {
      items: ConsentDirective[];
    };
  };
};

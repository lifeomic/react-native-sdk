import { ConsentDirective, SurveyResponse } from '../hooks/todayTile/types';
import { AppConfig } from '../hooks/useAppConfig';
import { ProjectInvite, User } from '../types';
import { FhirAPIEndpoints } from './fhir-api-types';

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
export type RestAPIEndpoints = FhirAPIEndpoints & {
  'GET /v1/accounts': {
    Request: {};
    Response: {
      accounts: Account[];
    };
  };

  'GET /v1/user': {
    Request: {};
    Response: User;
  };

  'GET /v1/features': {
    Request: {
      project?: string;
      tag?: string;
    };
    Response: {
      [feature: string]: boolean;
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

  'GET /v1/account/users/:userId': {
    Request: {};
    Response: User;
  };

  'POST /v1/client-tokens': {
    Request: {
      targetClientId: string;
    };
    Response: {
      code: string;
    };
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

  'GET /v1/life-research/projects/:projectId/app-config': {
    Request: { projectId: string };
    Response: AppConfig;
  };
};

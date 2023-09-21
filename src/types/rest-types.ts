import { ConsentDirective, SurveyResponse } from '../hooks/todayTile/types';
import {
  AppConfig,
  Account,
  Entry,
  Project,
  ProjectInvite,
  User,
} from '../types';

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

  'GET /v1/user': {
    Request: {};
    Response: User;
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

  'GET /v1/life-research/projects/:projectId/app-config': {
    Request: { projectId: string };
    Response: AppConfig;
  };

  'GET /v1/fhir/dstu3/$me': {
    Request: {};
    Response: {
      resourceType: 'Bundle';
      entry: Entry[];
    };
  };

  'GET /v1/projects': {
    Request: {
      id: string;
    };
    Response: {
      items: Project[];
    };
  };
};

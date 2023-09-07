/* istanbul ignore file */

import { ConsentExcept } from 'fhir/r3';

export interface Questionnaire_questionnaire_item_code {
  __typename: 'Coding';
  system: string | null;
  code: string | null;
}

export enum QuestionnaireStatus {
  active = 'active',
  draft = 'draft',
  retired = 'retired',
  unknown = 'unknown',
}

export enum QuestionnaireItemType {
  attachment = 'attachment',
  boolean = 'boolean',
  choice = 'choice',
  date = 'date',
  dateTime = 'dateTime',
  decimal = 'decimal',
  display = 'display',
  group = 'group',
  integer = 'integer',
  open_choice = 'open_choice',
  quantity = 'quantity',
  reference = 'reference',
  string = 'string',
  text = 'text',
  time = 'time',
  url = 'url',
}

export interface Questionnaire_questionnaire_item_option_valueCoding {
  __typename: 'Coding';
  system: string | null;
  code: string | null;
  display: string | null;
}

export interface Questionnaire_questionnaire_item_option {
  __typename: 'QuestionnaireOption';
  valueCoding: Questionnaire_questionnaire_item_option_valueCoding | null;
}

export interface Questionnaire_questionnaire_item {
  __typename: 'QuestionnaireItem';
  linkId: string | null;
  code: Questionnaire_questionnaire_item_code[] | null;
  text: string | null;
  type: QuestionnaireItemType | null;
  required: boolean | null;
  option: Questionnaire_questionnaire_item_option[] | null;
}

export enum QuestionnaireResourceType {
  Questionnaire = 'Questionnaire',
}

export interface Questionnaire_questionnaire {
  __typename: 'Questionnaire';
  resourceType: QuestionnaireResourceType;
  id: string | null;
  title: string | null;
  status: QuestionnaireStatus | null;
  item: Questionnaire_questionnaire_item[] | null;
}

export type ConsentForm = Questionnaire_questionnaire & {
  version: string;
};

export interface ConsentDirective {
  status: 'proposed' | 'active' | 'inactive' | 'rejected';
  form: ConsentForm;
  except?: ConsentExcept[];
  id: string;
}

export type RequiredConsentDirective = {
  form: ConsentForm;
  except?: ConsentExcept[];
  projectId: string;
  directiveId?: string;
};

export type ConsentTask = ConsentDirective &
  RequiredConsentDirective & {
    accountId: string;
    accountName: string;
  };

export interface SurveyResponse {
  id: string;
  status: string;
  questionnaire: {
    reference: string;
    display: string;
  };
  projectId: string;
  account: string;
  accountName: string;
  authored?: string;
  meta?: {
    tag: {
      system: string;
    }[];
  };
}

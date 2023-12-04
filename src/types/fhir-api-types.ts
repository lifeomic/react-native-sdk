import {
  Appointment,
  Bundle,
  Observation,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse,
} from 'fhir/r3';

/**
 * Add entries to this type to support them in the hooks.
 */
type FhirResourcesByName = {
  Patient: Patient;
  Observation: Observation;
  Questionnaire: Questionnaire;
  QuestionnaireResponse: QuestionnaireResponse;
  Appointment: Appointment;
  Practitioner: Practitioner;
};

/**
 * Add any globally-supported search params here.
 *
 * string and number are the only supported value types.
 */
type BaseSearchParams = {
  _tag?: string;
  pageSize?: number;
};

/**
 * Add resource-specific search params here.
 */
type AdditionalSearchParamsByName = {
  Appointment: {
    patient?: string;
    status?: Appointment['status'];
  };
};

type SearchParamsForResourceType<Name extends keyof FhirResourcesByName> =
  Name extends keyof AdditionalSearchParamsByName
    ? AdditionalSearchParamsByName[Name] & BaseSearchParams
    : BaseSearchParams;

type WithIdDefined<T extends { id?: string }> = T & { id: string };

export type FhirAPIEndpoints = {
  // POST /<resource>
  [Name in keyof FhirResourcesByName as `POST /v1/fhir/dstu3/${Name}`]: {
    Request: FhirResourcesByName[Name];
    Response: WithIdDefined<FhirResourcesByName[Name]>;
  };
} & {
  // PUT /<resource>/:resourceId
  [Name in keyof FhirResourcesByName as `PUT /v1/fhir/dstu3/${Name}/:resourceId`]: {
    Request: WithIdDefined<FhirResourcesByName[Name]>;
    Response: WithIdDefined<FhirResourcesByName[Name]>;
  };
} & {
  // GET /<resource>/:resourceId
  [Name in keyof FhirResourcesByName as `GET /v1/fhir/dstu3/${Name}/:resourceId`]: {
    Request: {};
    Response: WithIdDefined<FhirResourcesByName[Name]>;
  };
} & {
  // GET /<resource>
  [Name in keyof FhirResourcesByName as `GET /v1/fhir/dstu3/${Name}`]: {
    Request: SearchParamsForResourceType<Name>;
    Response: Bundle<WithIdDefined<FhirResourcesByName[Name]>>;
  };
};

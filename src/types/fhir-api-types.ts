import {
  Appointment,
  Bundle,
  Observation,
  Patient,
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

export type FhirAPIEndpoints = {
  // POST /<resource>
  [Name in keyof FhirResourcesByName as `POST /v1/fhir/dstu3/${Name}`]: {
    Request: FhirResourcesByName[Name];
    Response: FhirResourcesByName[Name];
  };
} & {
  // PUT /<resource>/:id
  [Name in keyof FhirResourcesByName as `PUT /v1/fhir/dstu3/${Name}/:id`]: {
    Request: FhirResourcesByName[Name] & { id: string };
    Response: FhirResourcesByName[Name];
  };
} & {
  // GET /<resource>/:id
  [Name in keyof FhirResourcesByName as `GET /v1/fhir/dstu3/${Name}/:id`]: {
    Request: {};
    Response: FhirResourcesByName[Name];
  };
} & {
  // GET /<resource>
  [Name in keyof FhirResourcesByName as `GET /v1/fhir/dstu3/${Name}`]: {
    Request: SearchParamsForResourceType<Name>;
    Response: Bundle<FhirResourcesByName[Name]>;
  };
};

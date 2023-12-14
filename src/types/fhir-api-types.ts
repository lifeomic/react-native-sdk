import {
  Appointment,
  Bundle,
  BundleEntry,
  Observation,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse,
  ProcedureRequest,
  DocumentReference,
} from 'fhir/r3';

// These "better" types strongly type the bundle
// to match the LifeOmic FHIR API guarantees.
type BetterEntry<T> = Omit<BundleEntry<T>, 'resource'> & {
  // `resource` is guaranteed to be defined by the API
  resource: T;
};

type BetterBundle<T> = Omit<Bundle<T>, 'entry'> & {
  // `entry` is guaranteed to be defined by the API
  entry: BetterEntry<T>[];
};

/**
 * Add entries to this type to support them in the hooks.
 */
type FhirResourcesByName = {
  Appointment: Appointment;
  DocumentReference: DocumentReference;
  Observation: Observation;
  Patient: Patient;
  Practitioner: Practitioner;
  ProcedureRequest: ProcedureRequest;
  Questionnaire: Questionnaire;
  QuestionnaireResponse: QuestionnaireResponse;
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
  Observation: {
    patient?: string;
  };
  ProcedureRequest: {
    patient?: string;
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
  // We specifically use :resourceId instead of :id here because the FHIR API
  // does a check between the path param property value and the data body
  // property value, and throws if they do not match. Since 'one-query' removes
  // any path params properties from the data body, having :id causes a failure.
  // PUT /<resource>/:resourceId
  [Name in keyof FhirResourcesByName as `PUT /v1/fhir/dstu3/${Name}/:resourceId`]: {
    Request: WithIdDefined<FhirResourcesByName[Name]>;
    Response: WithIdDefined<FhirResourcesByName[Name]>;
  };
} & {
  // GET /<resource>/:id
  [Name in keyof FhirResourcesByName as `GET /v1/fhir/dstu3/${Name}/:id`]: {
    Request: {};
    Response: WithIdDefined<FhirResourcesByName[Name]>;
  };
} & {
  // GET /<resource>
  [Name in keyof FhirResourcesByName as `GET /v1/fhir/dstu3/${Name}`]: {
    Request: SearchParamsForResourceType<Name>;
    Response: BetterBundle<WithIdDefined<FhirResourcesByName[Name]>>;
  };
} & {
  'GET /v1/fhir/dstu3/$me': {
    Request: {};
    Response: BetterBundle<WithIdDefined<Patient>>;
  };
};

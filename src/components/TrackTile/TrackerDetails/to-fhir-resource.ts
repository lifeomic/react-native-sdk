import { Tracker, TrackerResource } from '../services/TrackTileService';
import { toFhirProcedureResource } from './to-procedure-resource';
import { toFhirObservationResource } from './to-observation-resource';
import { pick } from 'lodash';

export type ResourceSettings = {
  id?: string;
  patientId?: string;
  accountId: string;
  projectId: string;
  createDate: Date;
  value: number;
  tracker: Pick<
    Tracker,
    'resourceType' | 'metricId' | 'units' | 'system' | 'unit' | 'name' | 'id'
  >;
};

export type Code = TrackerResource['code']['coding'][number];

const toFhirResource = (
  resourceType: 'Procedure' | 'Observation',
  from: ResourceSettings,
  codeIn?: Code,
): TrackerResource => {
  const code = codeIn && pick(codeIn, 'system', 'code', 'display');

  return resourceType === 'Observation'
    ? toFhirObservationResource(from, code)
    : toFhirProcedureResource(from, code);
};

export { toFhirResource };

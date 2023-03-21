import {
  TrackerResource,
  TRACKER_CODE_SYSTEM
} from '../services/TrackTileService';
import { format } from 'date-fns';
import { ResourceSettings, Code } from './to-fhir-resource';
import { convertToStoreUnit, getStoredUnitType } from '../util/convert-value';

const toFhirObservationResource = (
  from: ResourceSettings,
  code?: Code
): TrackerResource => {
  const { tracker, value, createDate } = from;
  const { id, datastoreSettings, patientId } = from;
  const { system, name: metricName } = tracker;
  const metricId = tracker.metricId ?? tracker.id;

  /** NOTE: Imagine we need, for example, a weight Observation that should be
   * stored in `kg` but has the option of `lbs`.  In this scenario, we need to
   * convert the user's "lbs" to "kg" before sending to patient-service.  We
   * don't have any Observatons like that at this time, but this gets us
   * started.
   */
  const storeValue = convertToStoreUnit(value, tracker);
  const unit = getStoredUnitType(tracker);

  return {
    id,
    effectiveDateTime: format(createDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    resourceType: 'Observation',
    valueQuantity: {
      code: unit.code,
      system: unit.system,
      unit: unit.unit,
      value: storeValue
    },
    ...(patientId
      ? {
          subject: {
            reference: `Patient/${patientId}`
          }
        }
      : undefined),
    meta: {
      tag: [
        {
          code: datastoreSettings.project,
          system: 'http://lifeomic.com/fhir/dataset'
        }
      ]
    },
    code: {
      coding: [
        ...(code ? [code] : []),
        {
          system: system ?? TRACKER_CODE_SYSTEM,
          code: metricId,
          display: metricName
        }
      ]
    },
    status: 'final'
  };
};

export { toFhirObservationResource };

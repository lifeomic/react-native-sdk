import {
  TrackerResource,
  TRACKER_CODE_SYSTEM,
} from '../services/TrackTileService';
import { format, addSeconds, startOfDay } from 'date-fns';
import { Code, ResourceSettings } from './to-fhir-resource';
import { convertToStoreUnit } from '../util/convert-value';

export const TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

const toFhirProcedureResource = (
  from: ResourceSettings,
  code?: Code,
): TrackerResource => {
  const { tracker, value, createDate } = from;
  const { id, accountSettings, patientId } = from;
  const { system, name: metricName } = tracker;
  const metricId = tracker.metricId ?? tracker.id;

  const startDate = startOfDay(createDate);
  const startTime = format(startDate, TIME_FORMAT);

  // NOTE: All Procedure units MUST use system http://unitsofmeasure.org
  const seconds = convertToStoreUnit(value, tracker);
  const endTime = addSeconds(startDate, seconds);

  return {
    id,
    resourceType: 'Procedure',
    performedPeriod: {
      start: startTime,
      end: format(endTime, TIME_FORMAT),
    },
    ...(patientId
      ? {
          subject: {
            reference: `Patient/${patientId}`,
          },
        }
      : undefined),
    meta: {
      tag: [
        {
          code: accountSettings?.project || '',
          system: 'http://lifeomic.com/fhir/dataset',
        },
      ],
    },
    code: {
      coding: [
        ...(code ? [code] : []),
        {
          system: system ?? TRACKER_CODE_SYSTEM,
          code: metricId,
          display: metricName,
        },
      ],
    },
    status: 'completed',
  };
};

export { toFhirProcedureResource };

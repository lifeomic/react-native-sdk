import { toFhirObservationResource } from './to-observation-resource';
import { format } from 'date-fns';
import { ResourceSettings } from './to-fhir-resource';

const createDate = new Date('2021-09-21T12:00:00.000');

const defaultResource = (resource: Partial<ResourceSettings> = {}) => ({
  ...resource,
  createDate,
  datastoreSettings: {
    account: 'datastore-account',
    project: 'id',
    ...resource.datastoreSettings
  },
  id: '1',
  value: 6,
  tracker: {
    id: 'user:username:project:1',
    metricId: '1',
    name: 'test',
    resourceType: 'Observation' as any,
    units: [
      {
        code: "[arb'U]",
        default: true,
        display: 'unit',
        system: 'system',
        target: 5,
        unit: 'unit'
      }
    ],
    unit: 'unit',
    system: 'http://lifeomic.com/fhir/custom-tracker-system'
  }
});

describe('toObservationResource', () => {
  it('should map to an observation resource', () => {
    const res = toFhirObservationResource(defaultResource());

    expect(res).toEqual(
      expect.objectContaining({
        id: '1',
        effectiveDateTime: format(createDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        resourceType: 'Observation',
        valueQuantity: {
          code: "[arb'U]",
          system: 'system',
          unit: 'unit',
          value: 6
        },
        meta: {
          tag: [
            {
              code: 'id',
              system: 'http://lifeomic.com/fhir/dataset'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'http://lifeomic.com/fhir/custom-tracker-system',
              code: '1',
              display: 'test'
            }
          ]
        },
        status: 'final'
      })
    );
  });

  it('should fallback to id if metricId is missing', () => {
    const resourceIn = defaultResource();
    resourceIn.tracker.metricId = undefined as any;
    resourceIn.tracker.id = 'uninstalled-id';
    const res = toFhirObservationResource(resourceIn);

    expect(res).toEqual(
      expect.objectContaining({
        code: {
          coding: [
            {
              system: 'http://lifeomic.com/fhir/custom-tracker-system',
              code: 'uninstalled-id',
              display: 'test'
            }
          ]
        }
      })
    );
  });

  it('should write to specific project for account', () => {
    const resourceIn = defaultResource({
      datastoreSettings: {
        account: 'account-id',
        project: 'project-id'
      },
      patientId: 'patient-id'
    });
    const res = toFhirObservationResource(resourceIn);

    expect(res).toEqual(
      expect.objectContaining({
        meta: {
          tag: [
            {
              code: 'project-id',
              system: 'http://lifeomic.com/fhir/dataset'
            }
          ]
        },
        subject: {
          reference: 'Patient/patient-id'
        }
      })
    );
  });
});

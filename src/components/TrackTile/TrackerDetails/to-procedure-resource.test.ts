import { toFhirProcedureResource, TIME_FORMAT } from './to-procedure-resource';
import { format, startOfDay, addSeconds } from 'date-fns';
import { ResourceSettings } from './to-fhir-resource';

jest.unmock('i18next');

const createDate = startOfDay(new Date('2021-09-21T12:00:00.000'));

const defaultResource = (
  code: 's' | 'min' | 'h',
  resource: Partial<ResourceSettings> = {},
) => ({
  ...resource,
  createDate,
  id: '1',
  accountSettings: {
    account: 'datastore-account',
    project: 'id',
    ...resource.accountSettings,
  },
  value: 5,
  tracker: {
    id: '1',
    metricId: '1',
    name: 'test',
    resourceType: 'Procedure' as any,
    units: [
      {
        code,
        default: true,
        display: 'unit',
        system: 'system',
        target: 5,
        unit: 'unit',
      },
    ],
    unit: 'unit',
    system: 'http://lifeomic.com/fhir/custom-tracker-system',
  },
});

describe('toProcedureResource', () => {
  it('should convert the time for seconds', () => {
    const res = toFhirProcedureResource(defaultResource('s'));

    expect(res).toEqual(
      expect.objectContaining({
        performedPeriod: {
          start: format(createDate, TIME_FORMAT),
          end: format(addSeconds(createDate, 5), TIME_FORMAT),
        },
      }),
    );
  });

  it('should convert the time for minutes', () => {
    const res = toFhirProcedureResource(defaultResource('min'));

    expect(res).toEqual(
      expect.objectContaining({
        performedPeriod: {
          start: format(createDate, TIME_FORMAT),
          end: format(addSeconds(createDate, 5 * 60), TIME_FORMAT),
        },
      }),
    );
  });

  it('should convert the time for hours', () => {
    const res = toFhirProcedureResource(defaultResource('h'));

    expect(res).toEqual(
      expect.objectContaining({
        performedPeriod: {
          start: format(createDate, TIME_FORMAT),
          end: format(addSeconds(createDate, 5 * 60 * 60), TIME_FORMAT),
        },
      }),
    );
  });

  it('should write to specific project for account', () => {
    const resourceIn = defaultResource('h', {
      accountSettings: {
        account: 'account-id',
        project: 'project-id',
      },
      patientId: 'patient-id',
    });
    const res = toFhirProcedureResource(resourceIn);

    expect(res).toEqual(
      expect.objectContaining({
        meta: {
          tag: [
            {
              code: 'project-id',
              system: 'http://lifeomic.com/fhir/dataset',
            },
          ],
        },
        subject: {
          reference: 'Patient/patient-id',
        },
      }),
    );
  });
});

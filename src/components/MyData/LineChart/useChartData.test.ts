import { renderHook } from '@testing-library/react-native';
import { startOfDay, addDays } from 'date-fns';
import { useFhirClient } from '../../../hooks';
import { useChartData } from './useChartData';
import { Trace } from './TraceLine';

jest.mock('../../../hooks/useFhirClient', () => ({
  useFhirClient: jest.fn(),
}));

const mockUseFhirClient = useFhirClient as any as jest.Mock;
const useSearchResourcesQuery = jest.fn();

describe('useChartData', () => {
  beforeEach(() => {
    useSearchResourcesQuery.mockReset();

    mockUseFhirClient.mockReturnValue({
      useSearchResourcesQuery,
    });
  });

  it('should fetch the trace data', () => {
    useSearchResourcesQuery
      .mockReturnValueOnce({
        data: {
          entry: [
            {
              resource: {
                resourceType: 'Observation',
                effectiveDateTime: new Date(0).toISOString(),
                valueQuantity: {
                  value: 5,
                },
              } as fhir3.Observation,
            },
          ],
        },
      })
      .mockReturnValueOnce({
        data: undefined,
      });

    const trace1: Trace = {
      label: 'Label',
      type: 'Observation',
      coding: [{ code: 'code', system: 'system' }],
    };

    const { result } = renderHook(() =>
      useChartData({
        dateRange: [new Date(0), new Date(0)],
        trace1,
      }),
    );

    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(1, {
      resourceType: 'Observation',
      coding: [{ code: 'code', system: 'system' }],
      dateRange: [new Date(0), new Date(0)],
      pageSize: 200,
    });
    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        enabled: false,
      }),
    );

    expect(result.current.trace1Data).toEqual([
      {
        size: 5,
        x: Number(startOfDay(new Date(0))),
        y: 5,
        trace: trace1,
      },
    ]);
    expect(result.current.trace2Data).toEqual([]);
  });

  it('should fetch both traces data', () => {
    useSearchResourcesQuery
      .mockReturnValueOnce({
        data: {
          entry: [
            {
              resource: {
                resourceType: 'Observation',
                effectiveDateTime: new Date(0).toISOString(),
              } as fhir3.Observation,
            },
            {
              resource: {
                resourceType: 'Observation',
                effectiveDateTime: new Date(0).toISOString(),
                valueQuantity: {
                  value: 3,
                },
              } as fhir3.Observation,
            },
          ],
        },
      })
      .mockReturnValueOnce({
        data: {
          entry: [
            {
              resource: {
                resourceType: 'Observation',
                effectiveDateTime: new Date(0).toISOString(),
                valueQuantity: {
                  value: 5,
                },
              } as fhir3.Observation,
            },
          ],
        },
      });

    const trace1: Trace = {
      label: 'Label',
      type: 'Observation',
      coding: [{ code: 'code', system: 'system' }],
    };
    const trace2: Trace = {
      label: 'Label',
      type: 'Observation',
      coding: [{ code: 'code2', system: 'system2' }],
    };

    const { result } = renderHook(() =>
      useChartData({
        dateRange: [new Date(0), new Date(0)],
        trace1,
        trace2,
      }),
    );

    // Fetch second trace
    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        resourceType: 'Observation',
        coding: [{ code: 'code2', system: 'system2' }],
        dateRange: [new Date(0), new Date(0)],
        pageSize: 200,
      }),
    );

    expect(result.current.trace1Data).toEqual([
      {
        x: Number(startOfDay(new Date(0))),
        y: 0,
        trace: trace1,
      },
      {
        x: Number(startOfDay(new Date(0))),
        y: 3,
        trace: trace1,
      },
    ]);
    expect(result.current.trace2Data).toEqual([
      {
        size: 5,
        x: Number(startOfDay(new Date(0))),
        y: 5,
        trace: trace2,
      },
    ]);
  });

  it('should fetch the data with a pageSize based on the dateRange', () => {
    useSearchResourcesQuery
      .mockReturnValueOnce({ data: { entry: [] } })
      .mockReturnValueOnce({ data: undefined });

    const trace1: Trace = {
      label: 'Label',
      type: 'Observation',
      coding: [{ code: 'code', system: 'system' }],
    };

    renderHook(() =>
      useChartData({
        dateRange: [new Date(0), addDays(new Date(0), 500)],
        trace1,
      }),
    );

    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(1, {
      resourceType: 'Observation',
      coding: [{ code: 'code', system: 'system' }],
      dateRange: [new Date(0), addDays(new Date(0), 500)],
      pageSize: 500,
    });
  });
});

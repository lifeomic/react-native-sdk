import { renderHook } from '@testing-library/react-native';
import { startOfDay } from 'date-fns';
import { useFhirClient } from '../../../hooks';
import { useChartData } from './useChartData';

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

    const { result } = renderHook(() =>
      useChartData({
        dateRange: [new Date(0), new Date(0)],
        trace1: {
          label: 'Label',
          type: 'Observation',
          code: { code: 'code', system: 'system' },
        },
      }),
    );

    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(1, {
      resourceType: 'Observation',
      coding: [{ code: 'code', system: 'system' }],
      dateRange: [new Date(0), new Date(0)],
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

    const { result } = renderHook(() =>
      useChartData({
        dateRange: [new Date(0), new Date(0)],
        trace1: {
          label: 'Label',
          type: 'Observation',
          code: { code: 'code', system: 'system' },
        },
        trace2: {
          label: 'Label',
          type: 'Observation',
          code: { code: 'code2', system: 'system2' },
        },
      }),
    );

    // Fetch second trace
    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        resourceType: 'Observation',
        coding: [{ code: 'code2', system: 'system2' }],
        dateRange: [new Date(0), new Date(0)],
      }),
    );

    expect(result.current.trace1Data).toEqual([
      {
        x: Number(startOfDay(new Date(0))),
        y: 0,
      },
      {
        x: Number(startOfDay(new Date(0))),
        y: 3,
      },
    ]);
    expect(result.current.trace2Data).toEqual([
      {
        size: 5,
        x: Number(startOfDay(new Date(0))),
        y: 5,
      },
    ]);
  });
});

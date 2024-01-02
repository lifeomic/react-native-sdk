import { renderHook } from '@testing-library/react-native';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { useFhirClient } from '../../../hooks';
import { useSleepChartData } from './useSleepChartData';

jest.mock('../../../hooks/useFhirClient', () => ({
  useFhirClient: jest.fn(),
}));

const mockUseFhirClient = useFhirClient as any as jest.Mock;
const useSearchResourcesQuery = jest.fn();

describe('useSleepChartData', () => {
  beforeEach(() => {
    useSearchResourcesQuery.mockReset();

    mockUseFhirClient.mockReturnValue({
      useSearchResourcesQuery,
    });
  });

  it('should handle loading states', () => {
    useSearchResourcesQuery
      // initially not fetched and not loaded
      .mockReturnValueOnce({
        isFetching: false,
        isFetched: false,
      })
      // transitions to fetching
      .mockReturnValueOnce({
        isFetching: true,
        isFetched: false,
      })
      // fetching complete
      .mockReturnValue({
        isFetching: false,
        isFetched: true,
      });

    const props = {
      dateRange: [new Date(0), new Date(0)] as [Date, Date],
    };

    const { result, rerender } = renderHook(useSleepChartData, {
      initialProps: props,
    });

    expect(result.current.isFetching).toBe(true);

    rerender(props);

    expect(result.current.isFetching).toBe(true);

    rerender(props);

    expect(result.current.isFetching).toBe(false);
  });

  it('should fetch the trace data', () => {
    const observation: fhir3.Observation = {
      resourceType: 'Observation',
      status: 'final',
      code: {},
      effectiveDateTime: new Date(10).toISOString(),
      valuePeriod: {
        start: new Date(0).toISOString(),
        end: new Date(10).toISOString(),
      },
      component: [
        {
          code: {},
          valuePeriod: {
            start: new Date(0).toISOString(),
            end: new Date(10).toISOString(),
          },
        },
      ],
    };
    useSearchResourcesQuery.mockReturnValue({
      isFetching: false,
      isFetched: true,
      data: {
        entry: [
          {
            resource: observation,
          },
        ],
      },
    });

    const { result } = renderHook(useSleepChartData, {
      initialProps: {
        dateRange: [new Date(0), new Date(0)],
      },
    });

    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(1, {
      resourceType: 'Observation',
      coding: [{ code: '258158006', system: 'http://snomed.info/sct' }],
      dateRange: [startOfDay(new Date(0)), endOfDay(new Date(0))],
      pageSize: 50,
    });

    expect(result.current.sleepData).toEqual([observation]);
    expect(result.current.xDomain.domain()[0]).toEqual(new Date(0));
    expect(result.current.xDomain.domain()[1]).toEqual(new Date(10));
  });

  it('should fetch the data with a pageSize based on the dateRange', () => {
    useSearchResourcesQuery.mockReturnValue({
      isFetching: false,
      isFetched: true,
      data: undefined,
    });

    renderHook(useSleepChartData, {
      initialProps: {
        dateRange: [new Date(0), addDays(new Date(0), 500)],
      },
    });

    expect(useSearchResourcesQuery).toHaveBeenNthCalledWith(1, {
      resourceType: 'Observation',
      coding: [{ code: '258158006', system: 'http://snomed.info/sct' }],
      dateRange: [startOfDay(new Date(0)), endOfDay(addDays(new Date(0), 500))],
      pageSize: 500,
    });
  });

  it('when dates change it should return the old data and range until the new data resolves', async () => {
    const observation1: fhir3.Observation = {
      resourceType: 'Observation',
      status: 'final',
      id: 'first',
      code: {},
      effectiveDateTime: new Date(10).toISOString(),
      valuePeriod: {
        start: new Date(0).toISOString(),
        end: new Date(10).toISOString(),
      },
    };
    const observation2: fhir3.Observation = {
      ...observation1,
      id: 'second',
    };

    const res1 = {
      isFetching: false,
      isFetched: true,
      data: {
        entry: [
          {
            resource: observation1,
          },
        ],
      },
    };

    const res2 = {
      isFetching: false,
      isFetched: true,
      data: {
        entry: [
          {
            resource: observation2,
          },
        ],
      },
    };

    const loadingState = {
      isFetching: true,
      isFetched: true,
    };

    useSearchResourcesQuery
      .mockReturnValueOnce(res1) // initial
      .mockReturnValueOnce(res1) // set chart data
      .mockReturnValueOnce(loadingState) // rerender - new date range
      .mockReturnValueOnce(loadingState) // new date range - setIsLoading
      .mockReturnValueOnce(res2) // resolve new data
      .mockReturnValueOnce(res2); // set new chart data

    const dateRange1 = [new Date(0), new Date(0)] as [Date, Date];
    const dateRange2 = [new Date(10), new Date(20)] as [Date, Date];

    const { result, rerender } = renderHook(useSleepChartData, {
      initialProps: {
        dateRange: dateRange1,
      },
    });

    expect(result.current.dateRange).toEqual(dateRange1);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.sleepData).toEqual([observation1]);

    expect(useSearchResourcesQuery).toHaveBeenCalledTimes(2);

    const changedProps = {
      dateRange: dateRange2,
    };

    rerender(changedProps);

    expect(result.current.isFetching).toBe(true);

    // Returns old date range with old data
    expect(result.current.dateRange).toEqual(dateRange1);
    expect(result.current.sleepData).toEqual([observation1]);

    rerender(changedProps);

    expect(result.current.isFetching).toBe(false);
    expect(result.current.dateRange).toEqual(dateRange2);
    expect(result.current.sleepData).toEqual([observation2]);
  });
});

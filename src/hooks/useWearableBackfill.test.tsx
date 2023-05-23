import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useWearableBackfill } from './useWearableBackfill';
import { addDays } from 'date-fns';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from './useGraphQLClient';
import { mockGraphQLResponse } from '../common/testHelpers/mockGraphQLResponse';
import { useHttpClient } from './useHttpClient';
import { WearablesSyncState } from '../components';
import { useFeature } from './useFeature';

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(() => ({ isFetched: true, accountHeaders: {} })),
}));
jest.mock('./useHttpClient', () => ({ useHttpClient: jest.fn(() => ({})) }));
jest.mock('./useFeature', () => ({
  useFeature: jest.fn(() => ({ data: true })),
}));
jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(() => ({
    activeProject: 'project-id',
    activeSubjectId: 'subjectId',
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const defaultResponse = {
  fitbit: {
    observationsConnection: {
      edges: [],
    },
    proceduresConnection: {
      edges: [],
    },
  },
};

const baseURL = 'https://some-domain/unit-test';
const renderHookWithInjectedClient = (state?: WearablesSyncState) => {
  return renderHook(useWearableBackfill, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <GraphQLClientContextProvider baseURL={baseURL}>
          {children}
        </GraphQLClientContextProvider>
      </QueryClientProvider>
    ),
    initialProps: state,
  });
};

const mockUseHttpClient = useHttpClient as any as jest.Mock;
const mockUseFeature = useFeature as any as jest.Mock;

describe('useWearableBackfill', () => {
  it('should calculate enabledBackfillWearables', async () => {
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      undefined,
      defaultResponse,
    );

    const { result, rerender } = renderHookWithInjectedClient();

    expect(result.current.enabledBackfillWearables).toEqual([]);

    await rerender({
      items: [
        {
          ehrId: 'ehrId',
          ehrType: 'fitbit',
        } as any,
      ],
    });

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(result.current.enabledBackfillWearables).toEqual(['ehrId']);
    });
  });

  it('should not add ehr to enabledBackfillWearables when data exists', async () => {
    const scope1 = mockGraphQLResponse(`${baseURL}/v1/graphql`, undefined, {
      ...defaultResponse,
      googleFit: defaultResponse.fitbit,
    });

    const { result, rerender } = renderHookWithInjectedClient({
      items: [
        {
          ehrId: 'ehrId',
          ehrType: 'fitbit',
        } as any,
        {
          ehrId: 'ehr2Id',
          ehrType: 'googleFit',
        } as any,
      ],
    });

    await waitFor(() => {
      expect(scope1.isDone()).toBe(true);
      expect(result.current.enabledBackfillWearables).toEqual([
        'ehrId',
        'ehr2Id',
      ]);
    });

    const scope2 = mockGraphQLResponse(`${baseURL}/v1/graphql`, undefined, {
      fitbit: {
        ...defaultResponse.fitbit,
        proceduresConnection: {
          edges: [
            {
              id: 'mockProcedureId',
            },
          ],
        },
      },
    });

    rerender({
      items: [
        {
          ehrId: 'ehrId',
          ehrType: 'fitbit',
        } as any,
      ],
    });

    await waitFor(() => {
      expect(scope2.isDone()).toBe(true);
      expect(result.current.enabledBackfillWearables).toEqual([]);
    });
  });

  it('should invoke a backfill', async () => {
    const mockDate = new Date();
    const mockDateNow = jest.spyOn(Date, 'now');
    mockDateNow.mockReturnValue(+mockDate);
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      undefined,
      defaultResponse,
    );
    const post = jest.fn().mockResolvedValue({
      data: {
        ingestionId: 'ingestionId',
      },
    });
    mockUseHttpClient.mockReturnValue({
      httpClient: {
        post,
      },
    });

    const { result } = renderHookWithInjectedClient({
      items: [
        {
          ehrId: 'ehrId',
          ehrType: 'fitbit',
        } as any,
      ],
    });

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
    });

    let data;
    await act(async () => {
      data = await result.current.backfillEHR('ehrId');
    });

    expect(data).toEqual(true);
    expect(post).toHaveBeenCalledWith('/ehrs/ehrId/backfill', {
      project: 'project-id',
      end: mockDate.toISOString(),
      start: addDays(mockDate, -30).toISOString(),
    });
  });

  it('should NOT invoke a backfill if feature is disabled', async () => {
    mockUseFeature.mockReturnValue({ data: false });

    const { result } = renderHookWithInjectedClient({
      items: [
        {
          ehrId: 'ehrId',
          ehrType: 'fitbit',
        } as any,
      ],
    });

    let data;
    await act(async () => {
      data = await result.current.backfillEHR('ehrId');
    });

    expect(data).toEqual(false);
  });

  it('handles an ehrType that cannot be backfilled', async () => {
    mockUseFeature.mockReturnValue({ data: true });
    const scope = mockGraphQLResponse(
      `${baseURL}/v1/graphql`,
      undefined,
      defaultResponse,
    );

    const { result, rerender } = renderHookWithInjectedClient();

    expect(result.current.enabledBackfillWearables).toEqual([]);

    await rerender({
      items: [
        {
          ehrId: 'ehrId',
          ehrType: 'dexcom',
        } as any,
      ],
    });

    await waitFor(() => {
      expect(scope.isDone()).toBe(true);
      expect(result.current.enabledBackfillWearables).toEqual([]);
    });
  });
});

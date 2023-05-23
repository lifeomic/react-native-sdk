import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';
import { useFhirClient } from './useFhirClient';
import { QueryClient, QueryClientProvider } from 'react-query';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { useHttpClient } from './useHttpClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const renderHookInContext = (useHook: Function) => {
  return renderHook(() => useHook(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { 'LifeOmic-Account': 'acct1' },
  });
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
    activeSubjectId: 'subjectId',
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
  axiosMock.reset();
});

// TODO: Expand these tests to be beyond happy path / basic.

describe('useSearchResourcesQuery', () => {
  test('sends FHIR search request', async () => {
    const resultBundle = {
      entry: [
        {
          resource: {
            id: 'o1',
          },
        },
        {
          resource: {
            id: 'o2',
          },
        },
      ],
    };
    axiosMock
      .onPost('/v1/fhir/dstu3/Observation/_search')
      .reply(200, resultBundle);

    function useTestHook() {
      const { useSearchResourcesQuery } = useFhirClient();
      const searchResult = useSearchResourcesQuery({
        resourceType: 'Observation',
      });
      return searchResult;
    }
    const { result } = renderHookInContext(useTestHook);

    expect(axiosMock.history.post[0].url).toBe(
      '/v1/fhir/dstu3/Observation/_search',
    );

    // NOTE: implicitly testing these default search params:
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify({
        _tag: 'http://lifeomic.com/fhir/dataset|projectId',
        patient: 'subjectId',
        next: '0',
        resourceType: 'Observation',
      }),
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(resultBundle);
    });
  });

  test('fetches the next page', async () => {
    const url = '/v1/fhir/dstu3/Observation/_search';
    const resultBundle1 = {
      entry: [
        {
          resource: {
            id: 'o1',
          },
        },
        {
          resource: {
            id: 'o2',
          },
        },
      ],
      link: [
        {
          relation: 'self',
          url,
        },
        {
          relation: 'next',
          url: `${url}?next=10`,
        },
      ],
    };
    const resultBundle2 = {
      entry: [
        {
          resource: {
            id: 'o3',
          },
        },
        {
          resource: {
            id: 'o4',
          },
        },
      ],
      link: [
        {
          relation: 'self',
          url: `${url}?next=10`,
        },
      ],
    };
    axiosMock
      .onPost('/v1/fhir/dstu3/Observation/_search')
      .replyOnce(200, resultBundle1);
    axiosMock
      .onPost('/v1/fhir/dstu3/Observation/_search')
      .replyOnce(200, resultBundle2);

    function useTestHook() {
      const { useSearchResourcesQuery } = useFhirClient();
      const searchResult = useSearchResourcesQuery({
        resourceType: 'Observation',
      });
      return searchResult;
    }
    const { result } = renderHookInContext(useTestHook);

    expect(axiosMock.history.post[0].url).toBe(
      '/v1/fhir/dstu3/Observation/_search',
    );

    // NOTE: implicitly testing these default search params:
    expect(axiosMock.history.post[0].data).toEqual(
      JSON.stringify({
        _tag: 'http://lifeomic.com/fhir/dataset|projectId',
        patient: 'subjectId',
        next: '0',
        resourceType: 'Observation',
      }),
    );
    await waitFor(() => {
      expect(result.current.data).toEqual(resultBundle1);
      expect(result.current.hasMoreData).toEqual(true);
    });

    // fetch the next page
    act(() => result.current.fetchNextPage());

    expect(axiosMock.history.post[1].url).toBe(
      '/v1/fhir/dstu3/Observation/_search',
    );
    expect(axiosMock.history.post[1].data).toEqual(
      JSON.stringify({
        _tag: 'http://lifeomic.com/fhir/dataset|projectId',
        patient: 'subjectId',
        next: '10',
        resourceType: 'Observation',
      }),
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(resultBundle2);
      expect(result.current.hasMoreData).toEqual(false);
    });
  });
});

describe('useCreateResourceMutation', () => {
  test('creates FHIR resource', async () => {
    const resultBundle = {
      resource: {
        id: 'o1',
      },
    };
    axiosMock.onPost('/v1/fhir/dstu3/Observation').reply(200, resultBundle);

    function useTestHook() {
      const { useCreateResourceMutation } = useFhirClient();
      return useCreateResourceMutation();
    }
    const { result } = renderHookInContext(useTestHook);

    const observation: fhir3.Observation = {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '29463-7',
            display: 'Body weight',
          },
        ],
      },
      valueQuantity: {
        code: 'kg',
        system: 'http://unitsofmeasure.org',
        value: 73.5,
      },
    };
    await act(async () => {
      await result.current.mutateAsync(observation);
    });

    expect(axiosMock.history.post[0].url).toBe('/v1/fhir/dstu3/Observation');
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      ...observation,

      // Verifying population of these default props:
      subject: {
        reference: 'Patient/subjectId',
      },
      effectiveDateTime: expect.anything(),
      meta: {
        tag: [
          { system: 'http://lifeomic.com/fhir/dataset', code: 'projectId' },
        ],
      },
    });
    await waitFor(() => {
      expect(result.current.data).toEqual(resultBundle);
    });
  });
});

describe('useDeleteResourceMutation', () => {
  test('deletes FHIR resource', async () => {
    const observationId = 'obsIdabc123';
    axiosMock
      .onDelete(`/v1/fhir/dstu3/Observation/${observationId}`)
      .reply(204);

    function useTestHook() {
      const { useDeleteResourceMutation } = useFhirClient();
      return useDeleteResourceMutation();
    }
    const { result } = renderHookInContext(useTestHook);
    await act(async () => {
      await result.current.mutateAsync({
        id: observationId,
        resourceType: 'Observation',
      });
    });

    expect(axiosMock.history.delete[0].url).toBe(
      `/v1/fhir/dstu3/Observation/${observationId}`,
    );
  });
});

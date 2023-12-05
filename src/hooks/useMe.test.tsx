import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useMe } from './useMe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpClientContextProvider } from './useHttpClient';
import { ActiveAccountProvider } from './useActiveAccount';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { Patient } from 'fhir/r3';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const api = createRestAPIMock();

const renderHookInContext = async () => {
  return renderHook(() => useMe(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ActiveAccountProvider account="mockaccount">
          <HttpClientContextProvider>{children}</HttpClientContextProvider>
        </ActiveAccountProvider>
      </QueryClientProvider>
    ),
  });
};

test('fetches and parses $me', async () => {
  const subject1: Patient & { id: string } = {
    resourceType: 'Patient',
    id: 'patientId1',
    meta: {
      tag: [
        {
          system: 'http://lifeomic.com/fhir/dataset',
          code: 'projectId1',
        },
      ],
    },
  };
  const subject2: Patient & { id: string } = {
    resourceType: 'Patient',
    id: 'patientId2',
    meta: {
      tag: [
        {
          system: 'http://lifeomic.com/fhir/dataset',
          code: 'projectId2',
        },
      ],
    },
  };

  api.mock('GET /v1/fhir/dstu3/$me', {
    status: 200,
    data: {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: subject1 }, { resource: subject2 }],
    },
  });

  const { result } = await renderHookInContext();
  await waitFor(() => {
    expect(result.current.data).toEqual([
      { subjectId: 'patientId1', projectId: 'projectId1', subject: subject1 },
      { subjectId: 'patientId2', projectId: 'projectId2', subject: subject2 },
    ]);
  });
});

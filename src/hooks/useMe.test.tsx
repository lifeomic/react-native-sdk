import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useActiveAccount } from './useActiveAccount';
import { useMe } from './useMe';
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
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const renderHookInContext = async () => {
  return renderHook(() => useMe(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { Authorization: 'Bearer accessToken' },
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
});

test('fetches and parses $me', async () => {
  axiosMock.onGet('/v1/fhir/dstu3/$me').reply(200, {
    entry: [
      {
        resource: {
          id: 'patientId1',
          meta: {
            tag: [
              {
                system: 'http://lifeomic.com/fhir/dataset',
                code: 'projectId1',
              },
            ],
          },
        },
      },
      {
        resource: {
          id: 'patientId2',
          meta: {
            tag: [
              {
                system: 'http://lifeomic.com/fhir/dataset',
                code: 'projectId2',
              },
            ],
          },
        },
      },
    ],
  });
  const { result } = await renderHookInContext();
  await waitFor(() => result.current.isSuccess);
  expect(axiosMock.history.get[0].url).toBe('/v1/fhir/dstu3/$me');
  await waitFor(() => {
    expect(result.current.data).toEqual([
      { subjectId: 'patientId1', projectId: 'projectId1' },
      { subjectId: 'patientId2', projectId: 'projectId2' },
    ]);
  });
});

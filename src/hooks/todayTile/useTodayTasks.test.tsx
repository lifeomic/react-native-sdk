import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodayTasks } from './useTodayTasks';
import { createRestAPIMock } from '../../test-utils/rest-api-mocking';
import { ConsentDirective, SurveyResponse } from './types';

const api = createRestAPIMock();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderHookInContext = async () => {
  return renderHook(() => useTodayTasks(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

test('newTasks count 0 when no items are returns', async () => {
  api.mock(
    'GET /v1/consent/directives/me',
    jest.fn().mockReturnValue({
      status: 200,
      data: { items: [] },
    }),
  );
  api.mock(
    'GET /v1/survey/projects/:projectId/responses',
    jest.fn().mockReturnValue({
      status: 200,
      data: { items: [] },
    }),
  );
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current.newTasks.length).toEqual(0);
  });
});

test('consents and surveys are summed and categorized correctly', async () => {
  const directives: ConsentDirective[] = [
    {
      status: 'proposed',
      form: {} as any,
      id: 'consent1',
    },
    {
      status: 'active',
      form: {} as any,
      id: 'consent1',
    },
    {
      status: 'rejected',
      form: {} as any,
      id: 'consent2',
    },
  ];

  const surveys: Partial<SurveyResponse>[] = [
    {
      status: 'in-progress',
    },
  ];

  api.mock(
    'GET /v1/consent/directives/me',
    jest.fn().mockReturnValue({
      status: 200,
      data: { items: directives },
    }),
  );
  api.mock(
    'GET /v1/survey/projects/:projectId/responses',
    jest.fn().mockReturnValue({
      status: 200,
      data: { items: surveys },
    }),
  );
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current.newTasks.length).toEqual(2);
  });
});

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTodayTasks } from './useTodayTasks';
import { createRestAPIMock } from '../../test-utils/rest-api-mocking';
import { useMe } from '../useMe';
import { useUser } from '../useUser';
import { useActiveProject } from '../useActiveProject';
import { ConsentDirective, SurveyResponse } from './types';
import { useActiveAccount } from '../useActiveAccount';

jest.mock('../useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('../useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../useMe', () => ({
  useMe: jest.fn(),
}));
jest.mock('../useUser', () => ({
  useUser: jest.fn(),
}));

const useActiveProjectMock = useActiveProject as jest.Mock;
const useActiveAccountMock = useActiveAccount as jest.Mock;
const useMeMock = useMe as jest.Mock;
const useUserMock = useUser as jest.Mock;

const mockMe = [
  {
    projectId: 'proj1',
    subjectId: 'subject1',
  },
  {
    projectId: 'proj2',
    subjectId: 'subject2',
  },
];

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

beforeEach(() => {
  useActiveProjectMock.mockReturnValue({
    activeProject: {
      id: 'proj1',
      name: 'Project1',
    },
    activeSubjectId: '1234',
  });
  useMeMock.mockReturnValue({
    data: mockMe,
    isLoading: false,
    isFetched: true,
  });
  useUserMock.mockReturnValue({
    data: { id: 'mockUser' },
  });
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { 'LifeOmic-Account': 'lifeomic' },
  });
});

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
    {
      status: 'completed',
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
    expect(result.current.doneTasks.length).toEqual(3);
  });
});

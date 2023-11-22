import React from 'react';
import {
  act,
  render,
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { useSubjectProjects } from './useSubjectProjects';
import { useMe } from './useMe';
import { useUser } from './useUser';
import {
  ActiveProjectContextProvider,
  useActiveProject,
} from './useActiveProject';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

jest.mock('./useSubjectProjects', () => ({
  useSubjectProjects: jest.fn(),
}));
jest.mock('./useMe', () => ({
  useMe: jest.fn(),
}));
jest.mock('./useUser', () => ({
  useUser: jest.fn(),
}));

const useSubjectProjectsMock = useSubjectProjects as jest.Mock;
const useMeMock = useMe as jest.Mock;
const useUserMock = useUser as jest.Mock;

const mockSubjectProjects = [
  {
    id: 'proj1',
    name: 'Project 1',
  },
  {
    id: 'proj2',
    name: 'Project 2',
  },
];
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

const renderHookInContext = async () => {
  return renderHook(() => useActiveProject(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <ActiveProjectContextProvider>{children}</ActiveProjectContextProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(async () => {
  useSubjectProjectsMock.mockReturnValue({
    status: 'success',
    data: mockSubjectProjects,
    isLoading: false,
    isFetched: true,
  });
  useMeMock.mockReturnValue({
    status: 'success',
    data: mockMe,
    isLoading: false,
    isFetched: true,
  });
  useUserMock.mockReturnValue({
    status: 'success',
    data: { id: 'mockUser' },
  });
  await AsyncStorage.clear();
});

test('without provider, hook throws', () => {
  expect(() => renderHook(() => useActiveProject())).toThrowError(
    'useActiveProject must be used within an ActiveProjectContextProvider',
  );
});

test('converts useSubjectProjects and useMe data into helpful state', async () => {
  const { result } = await renderHookInContext();
  await waitFor(() => {
    expect(result.current).toMatchObject({
      activeProject: mockSubjectProjects[0],
      activeSubjectId: mockMe[0].subjectId,
    });
  });
});

test('exposes some props from useSubjectProjects and useMe', async () => {
  const error = new Error('uh oh');
  useSubjectProjectsMock.mockReturnValue({
    status: 'loading',
  });
  useMeMock.mockReturnValue({
    status: 'error',
    error,
  });
  const { result, rerender } = await renderHookInContext();
  // returns nothing in loading / error
  expect(result.current).toStrictEqual(null);

  useSubjectProjectsMock.mockReturnValue({
    status: 'success',
    data: mockSubjectProjects,
  });
  useMeMock.mockReturnValue({
    status: 'success',
    data: mockMe,
  });

  rerender({});

  await waitFor(() => {
    expect(result.current).toStrictEqual({
      activeProject: {
        id: 'proj1',
        name: 'Project 1',
      },
      activeSubject: {
        projectId: 'proj1',
        subjectId: 'subject1',
      },
      activeSubjectId: 'subject1',
      setActiveProjectId: expect.any(Function),
    });
  });
});

test('setActiveProjectId saves projectId', async () => {
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current).toMatchObject({
      activeProject: mockSubjectProjects[0],
      activeSubjectId: mockMe[0].subjectId,
    });
  });

  await act(async () => {
    result.current.setActiveProjectId(mockSubjectProjects[1].id);
  });

  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[1],
    activeSubjectId: mockMe[1].subjectId,
  });
});

test('setActiveProjectId ignores invalid projectId', async () => {
  const { result, rerender } = await renderHookInContext();
  await waitFor(() => {
    expect(result.current).toBeTruthy();
  });
  await act(async () => {
    result.current.setActiveProjectId('invalid project');
  });
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });

  useMeMock.mockReturnValue({
    isFetched: true,
    data: [mockMe[0]], // NOTE: mockMe[1] not there - weird edge case
  });
  await rerender({});
  act(() => {
    result.current.setActiveProjectId(mockSubjectProjects[1].id);
  });
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });
});

test('uses projectId from async storage', async () => {
  await AsyncStorage.setItem(
    'selectedProjectIdKey:mockUser',
    mockSubjectProjects[0].id,
  );
  const { result } = await renderHookInContext();

  await waitFor(() => {
    expect(result.current).toMatchObject({
      activeProject: mockSubjectProjects[0],
      activeSubjectId: mockMe[0].subjectId,
    });
  });

  await AsyncStorage.setItem(
    'selectedProjectIdKey:mockUser',
    mockSubjectProjects[1].id,
  );

  const { result: nextResult } = await renderHookInContext();
  await waitFor(() => {
    expect(nextResult.current).toMatchObject({
      activeProject: mockSubjectProjects[1],
      activeSubjectId: mockMe[1].subjectId,
    });
  });
});

test('initial render writes selected projectId to async storage', async () => {
  await renderHookInContext();

  await waitFor(async () => {
    const value = await AsyncStorage.getItem('selectedProjectIdKey:mockUser');
    expect(value).toStrictEqual(mockSubjectProjects[0].id);
  });
});

test('setActiveProjectId writes selected projectId to async storage', async () => {
  const { result } = await renderHookInContext();
  await waitFor(async () => {
    const value = await AsyncStorage.getItem('selectedProjectIdKey:mockUser');
    expect(value).toStrictEqual(mockSubjectProjects[0].id);
  });
  await act(async () => {
    result.current.setActiveProjectId(mockSubjectProjects[1].id);
  });
  await waitFor(async () => {
    const value = await AsyncStorage.getItem('selectedProjectIdKey:mockUser');
    expect(value).toStrictEqual(mockSubjectProjects[1].id);
  });
});

test('renders the InviteRequired screen if the user is not a patient', async () => {
  useSubjectProjectsMock.mockReturnValue({
    status: 'success',
    // No projects
    data: [],
    isLoading: false,
    isFetched: true,
  });
  const screen = render(
    <QueryClientProvider client={new QueryClient()}>
      <ActiveProjectContextProvider>
        <Text>content</Text>
      </ActiveProjectContextProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => {
    screen.getByText(
      'This app is only available to use by invitation. Please contact your administrator for access.',
    );
  });
});

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSubjectProjects } from './useSubjectProjects';
import { useMe } from './useMe';
import {
  ActiveProjectContextProvider,
  useActiveProject,
} from './useActiveProject';
import * as useAsyncStorage from './useAsyncStorage';
import { QueryClient, QueryClientProvider, UseQueryResult } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { mockDeep } from 'jest-mock-extended';

jest.mock('./useSubjectProjects', () => ({
  useSubjectProjects: jest.fn(),
}));
jest.mock('./useMe', () => ({
  useMe: jest.fn(),
}));

const useSubjectProjectsMock = useSubjectProjects as jest.Mock;
const useMeMock = useMe as jest.Mock;
let useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');

const mockSubjectProjects = [
  {
    id: 'proj1',
    name: 'Project 1',
  },
  {
    id: 'proj2',
    name: 'Project 1',
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

beforeEach(() => {
  useSubjectProjectsMock.mockReturnValue({
    data: mockSubjectProjects,
  });
  useMeMock.mockReturnValue({
    data: mockMe,
  });

  useAsyncStorageSpy.mockReturnValue([
    {
      ...mockDeep<UseQueryResult<string | null>>(),
    },
    (value: string) => AsyncStorage.setItem('selectedProjectIdKey', value),
  ]);
});

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useActiveProject());
  await expect(
    result.current.setActiveProjectId('bogus'),
  ).rejects.toBeUndefined();
});

test('converts useSubjectProjects and useMe data into helpful state', async () => {
  const { result } = await renderHookInContext();
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });
});

test('exposes some props from useSubjectProjects and useMe', async () => {
  const error = new Error('uh oh');
  useSubjectProjectsMock.mockReturnValue({
    isLoading: true,
    isFetched: true,
    error,
  });
  const { result, rerender } = await renderHookInContext();
  expect(result.current).toMatchObject({
    isLoading: true,
    isFetched: false,
    error,
  });

  useSubjectProjectsMock.mockReturnValue({
    isLoading: false,
    isFetched: true,
  });
  useMeMock.mockReturnValue({
    isLoading: true,
    isFetched: true,
    error,
  });

  await rerender({});

  expect(result.current).toMatchObject({
    isLoading: true,
    isFetched: true,
    error,
  });
});

test('setActiveProjectId saves projectId', async () => {
  const { result } = await renderHookInContext();

  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
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
  await act(async () => {
    result.current.setActiveProjectId('invalid project');
  });
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });

  useMeMock.mockReturnValue({
    data: [mockMe[0]], // NOTE: mockMe[1] not there - weird edge case
  });
  await rerender({});
  await act(async () => {
    result.current.setActiveProjectId(mockSubjectProjects[1].id);
  });
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });
});

test('uses projectId from async storage', async () => {
  useAsyncStorageSpy.mockRestore();

  AsyncStorageMock.getItem = jest
    .fn()
    .mockResolvedValueOnce(mockSubjectProjects[0].id);
  const { result, rerender } = await renderHookInContext();
  await waitFor(() => result.current.isLoading === false);
  rerender({});
  expect(AsyncStorage.getItem).toBeCalledWith('selectedProjectIdKey');
  expect(result.current).toMatchObject({
    activeProject: mockSubjectProjects[0],
    activeSubjectId: mockMe[0].subjectId,
  });

  AsyncStorageMock.getItem = jest
    .fn()
    .mockResolvedValueOnce(mockSubjectProjects[1].id);
  const { result: nextResult, rerender: nextRerender } =
    await renderHookInContext();
  await waitFor(() => nextResult.current.isLoading === false);
  nextRerender({});
  expect(nextResult.current).toMatchObject({
    activeProject: mockSubjectProjects[1],
    activeSubjectId: mockMe[1].subjectId,
  });

  useAsyncStorageSpy = jest.spyOn(useAsyncStorage, 'useAsyncStorage');
});

test('initial render writes selected projectId to async storage', async () => {
  await renderHookInContext();
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedProjectIdKey',
    mockSubjectProjects[0].id,
  );
});

test('setActiveProjectId writes selected projectId to async storage', async () => {
  const { result } = await renderHookInContext();
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedProjectIdKey',
    mockSubjectProjects[0].id,
  );
  await act(async () => {
    result.current.setActiveProjectId(mockSubjectProjects[1].id);
  });
  expect(AsyncStorageMock.setItem).toBeCalledWith(
    'selectedProjectIdKey',
    mockSubjectProjects[1].id,
  );
});

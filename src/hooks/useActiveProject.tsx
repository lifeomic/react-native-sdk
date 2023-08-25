import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { Subject, useMe } from './useMe';
import { Project, useSubjectProjects } from './useSubjectProjects';
import { useAsyncStorage } from './useAsyncStorage';
import { useUser } from './useUser';

const selectedProjectIdKey = 'selectedProjectIdKey';

export type ActiveProjectProps = {
  activeProject?: Project;
  activeSubjectId?: string;
  activeSubject?: Subject;
};

export type ActiveProjectContextProps = ActiveProjectProps & {
  setActiveProjectId: (projectId: string) => void;
  isLoading: boolean;
  isFetched: boolean;
  error?: any;
};

export const ActiveProjectContext = createContext({
  setActiveProjectId: () => Promise.reject(),
  isLoading: true,
  isFetched: false,
} as ActiveProjectContextProps);

const findProjectAndSubjectById = (
  projectId?: string | null,
  projects?: Project[],
  subjects?: Subject[],
) => {
  const getDefault = () => {
    const defaultProject = projects?.[0];
    const defaultSubject = subjects?.find(
      (s) => s.projectId === defaultProject?.id,
    );
    return { selectedProject: defaultProject, selectedSubject: defaultSubject };
  };

  if (!projectId) {
    return getDefault();
  }

  const selectedProject = projects?.find((p) => p.id === projectId);
  const selectedSubject = subjects?.find((s) => s.projectId === projectId);
  if (!selectedProject || !selectedSubject) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Ignoring attempt to set invalid projectId', projectId);
    }
    return getDefault();
  }
  return { selectedProject, selectedSubject };
};

export const ActiveProjectContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const projectsResult = useSubjectProjects();
  const projectLoading = projectsResult.isLoading || !projectsResult.isFetched;

  const useMeResult = useMe();
  const useMeLoading = useMeResult.isLoading || !useMeResult.isFetched;
  const { data: userData } = useUser();
  const userId = userData?.id;
  const [selectedId, setSelectedId] = useState<string>();
  const [previousUserId, setPreviousUserId] = useState(userId);
  const [storedProjectIdResult, setStoredProjectId] = useAsyncStorage(
    `${selectedProjectIdKey}:${userId}`,
  );

  /**
   * Initial setting of activeProject
   */
  const hookReturnValue = useMemo<ActiveProjectProps>(() => {
    if (
      !userId || // wait for user id before reading and writing to storage
      projectLoading || // wait for projects endpoint
      useMeLoading || // wait for subjects endpoint
      storedProjectIdResult.isLoading ||
      storedProjectIdResult.isError // wait for async storage result or error
    ) {
      return {};
    }

    const { selectedProject, selectedSubject } = findProjectAndSubjectById(
      selectedId ?? storedProjectIdResult.data,
      projectsResult.data,
      useMeResult.data,
    );

    if (selectedProject && selectedSubject) {
      return {
        activeProject: selectedProject,
        activeSubjectId: selectedSubject.subjectId,
        activeSubject: selectedSubject,
      };
    }

    return {};
  }, [
    storedProjectIdResult.data,
    storedProjectIdResult.isLoading,
    storedProjectIdResult.isError,
    projectsResult.data,
    useMeResult.data,
    projectLoading,
    useMeLoading,
    userId,
    selectedId,
  ]);

  useEffect(() => {
    if (hookReturnValue?.activeProject?.id) {
      setStoredProjectId(hookReturnValue?.activeProject?.id);
    }
  }, [hookReturnValue?.activeProject?.id, setStoredProjectId]);

  // Clear selected project when
  // we've detected that the userId has changed
  useEffect(() => {
    if (userId !== previousUserId) {
      projectsResult.refetch();
      setPreviousUserId(userId);
    }
  }, [previousUserId, userId, projectsResult]);

  const setActiveProjectId = useCallback(
    (projectId: string) => {
      const { selectedProject } = findProjectAndSubjectById(
        projectId,
        projectsResult.data,
        useMeResult.data,
      );

      if (selectedProject) {
        setSelectedId(selectedProject.id);
      }
    },
    [projectsResult.data, useMeResult.data],
  );

  return (
    <ActiveProjectContext.Provider
      value={{
        ...hookReturnValue,
        setActiveProjectId,
        isLoading: !!(
          projectsResult.isLoading ||
          useMeResult.isLoading ||
          storedProjectIdResult.isLoading
        ),
        isFetched: !!(
          projectsResult.isFetched &&
          useMeResult.isFetched &&
          storedProjectIdResult.isFetched
        ),
        error: projectsResult.error || useMeResult.error,
      }}
    >
      {children}
    </ActiveProjectContext.Provider>
  );
};

export const useActiveProject = () => useContext(ActiveProjectContext);

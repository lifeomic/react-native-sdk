import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import { Subject, useMe } from './useMe';
import { Project, useSubjectProjects } from './useSubjectProjects';
import { useAsyncStorage } from './useAsyncStorage';

const selectedProjectIdKey = 'selectedProjectIdKey';

export type ActiveProjectProps = {
  activeProject?: Project;
  activeSubjectId?: string;
};

export type ActiveProjectContextProps = ActiveProjectProps & {
  setActiveProjectId: (projectId: string) => Promise<void>;
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
  const useMeResult = useMe();
  const [hookReturnValue, setHookReturnValue] = useState<ActiveProjectProps>(
    {},
  );
  const [storedProjectIdResult, setStoredProjectId] =
    useAsyncStorage(selectedProjectIdKey);

  /**
   * Initial setting of activeProject
   */
  useEffect(() => {
    if (
      hookReturnValue.activeProject?.id || // active project already set
      !projectsResult.data?.length || // wait for projects endpoint to return data
      !useMeResult.data?.length || // wait for subjects endpoint to return data
      (storedProjectIdResult.isLoading && !storedProjectIdResult.isError) // wait for async storage result or error
    ) {
      return;
    }

    const { selectedProject, selectedSubject } = findProjectAndSubjectById(
      storedProjectIdResult.data,
      projectsResult.data,
      useMeResult.data,
    );

    if (selectedProject && selectedSubject) {
      setHookReturnValue({
        activeProject: selectedProject,
        activeSubjectId: selectedSubject.subjectId,
      });
      setStoredProjectId(selectedProject.id);
    }
  }, [
    storedProjectIdResult.data,
    storedProjectIdResult.isLoading,
    storedProjectIdResult.isError,
    projectsResult.data,
    useMeResult.data,
    hookReturnValue.activeProject?.id,
    setStoredProjectId,
  ]);

  const setActiveProjectId = useCallback(
    async (projectId: string) => {
      const { selectedProject, selectedSubject } = findProjectAndSubjectById(
        projectId,
        projectsResult.data,
        useMeResult.data,
      );

      if (selectedProject && selectedSubject) {
        setHookReturnValue({
          activeProject: selectedProject,
          activeSubjectId: selectedSubject.subjectId,
        });
        await setStoredProjectId(selectedProject.id);
      }
    },
    [projectsResult.data, useMeResult.data, setStoredProjectId],
  );

  return (
    <ActiveProjectContext.Provider
      value={{
        ...hookReturnValue,
        setActiveProjectId,
        isLoading: !!(projectsResult.isLoading || useMeResult.isLoading),
        isFetched: !!(projectsResult.isFetched && useMeResult.isFetched),
        error: projectsResult.error || useMeResult.error,
      }}
    >
      {children}
    </ActiveProjectContext.Provider>
  );
};

export const useActiveProject = () => useContext(ActiveProjectContext);

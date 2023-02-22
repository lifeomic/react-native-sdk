import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
import { useMe } from './useMe';
import { Project, useSubjectProjects } from './useSubjectProjects';

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

const ActiveProjectContext = createContext({
  setActiveProjectId: () => Promise.reject(),
  isLoading: true,
  isFetched: false,
} as ActiveProjectContextProps);

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

  const setActiveProjectId = useCallback(
    async (projectId: string) => {
      const selectedProject = projectsResult.data?.find(
        (p) => p.id === projectId,
      );
      const selectedSubject = useMeResult.data?.find(
        (s) => s.projectId === projectId,
      );
      if (!selectedProject || !selectedSubject) {
        console.warn('Ignoring attempt to set invalid projectId', projectId);
        return;
      }

      // TODO: Save for previously-selected project

      setHookReturnValue({
        activeProject: selectedProject,
        activeSubjectId: selectedSubject.subjectId,
      });
    },
    [projectsResult.data, useMeResult.data],
  );

  useEffect(() => {
    if (projectsResult.data?.length) {
      // TODO: Load previously-selected project

      const firstProjectId = projectsResult.data?.[0].id;
      if (firstProjectId) {
        setActiveProjectId(firstProjectId);
      }
    }
  }, [projectsResult.data, setActiveProjectId]);

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

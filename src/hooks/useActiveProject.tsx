import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { useSession } from './useSession';
import { useActiveAccount } from './useActiveAccount';
import { SubjectWithProject } from '../types';
const selectedProjectIdKey = 'selectedProjectIdKey';

export type ActiveSubjectProject = {
  activeSubject?: SubjectWithProject;
};

export type ActiveProjectContextProps = ActiveSubjectProject & {
  setActiveProjectId: (projectId: string) => void;
  isLoading: boolean;
};

export const ActiveProjectContext = createContext({
  setActiveProjectId: () => Promise.reject(),
  isLoading: true,
} as ActiveProjectContextProps);

export const ActiveProjectContextProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { userConfiguration, isLoaded } = useSession();
  const { user, configurations } = userConfiguration;
  const { account } = useActiveAccount();

  const [selectedId, setSelectedId] = useState<string>();
  const configuration = configurations.find((c) => c.account === account?.id);

  const [storedProjectIdResult, setStoredProjectId, isStorageLoaded] =
    useAsyncStorage(`${selectedProjectIdKey}:${user.id}`, isLoaded);

  /**
   * Initial setting of activeProject
   */
  const hookReturnValue = useMemo<ActiveSubjectProject | undefined>(() => {
    if (!isLoaded || !isStorageLoaded) {
      return undefined;
    }

    const projectToSelect = selectedId ?? storedProjectIdResult;
    const subjectAndProject = projectToSelect
      ? configuration?.subjects.find((s) => s.projectId === projectToSelect)
      : configuration?.subjects[0];
    return subjectAndProject ? { activeSubject: subjectAndProject } : undefined;
  }, [
    configuration?.subjects,
    isLoaded,
    isStorageLoaded,
    storedProjectIdResult,
    selectedId,
  ]);

  useEffect(() => {
    if (hookReturnValue?.activeSubject?.projectId) {
      setStoredProjectId(hookReturnValue?.activeSubject?.projectId);
    }
  }, [hookReturnValue, setStoredProjectId]);

  const setActiveProjectId = useCallback(
    (projectId: string) => {
      const subjectAndProject = configuration?.subjects.find(
        (s) => s.projectId === projectId,
      );

      if (subjectAndProject) {
        setSelectedId(subjectAndProject.projectId);
      }
    },
    [configuration?.subjects],
  );

  return (
    <ActiveProjectContext.Provider
      value={{
        ...hookReturnValue,
        setActiveProjectId,
        isLoading: !isLoaded || !isStorageLoaded,
      }}
    >
      {children}
    </ActiveProjectContext.Provider>
  );
};

export const useActiveProject = () => useContext(ActiveProjectContext);

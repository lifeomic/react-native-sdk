import React, { createContext, useState, useContext, useEffect } from 'react';
import { Subject, useMe } from './useMe';
import { Project, useSubjectProjects } from './useSubjectProjects';
import { useAsyncStorage } from './useAsyncStorage';
import { useUser } from './useUser';
import { combineQueries } from '@lifeomic/one-query';
import { ActivityIndicatorView } from '../components';
import { t } from 'i18next';
import { InviteRequiredScreen } from '../screens/InviteRequiredScreen';

const selectedProjectIdKey = 'selectedProjectIdKey';

export type ActiveProjectContextValue = {
  activeProject: Project;
  activeSubjectId: string;
  activeSubject: Subject;
  setActiveProjectId: (projectId: string) => void;
};

export const ActiveProjectContext = createContext<
  ActiveProjectContextValue | undefined
>(undefined);

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
  const query = combineQueries([useSubjectProjects(), useMe(), useUser()]);
  const userId = query.data?.[2].id;
  const [selectedId, setSelectedId] = useState<string>();
  const [storedProjectIdResult, setStoredProjectId, isStorageLoaded] =
    useAsyncStorage(
      `${selectedProjectIdKey}:${userId}`,
      !!selectedProjectIdKey && !!userId,
    );

  useEffect(() => {
    if (selectedId) {
      setStoredProjectId(selectedId);
    }
  }, [selectedId, setStoredProjectId]);

  if (query.status !== 'success' || !isStorageLoaded) {
    return (
      <ActivityIndicatorView
        message={t('waiting-for-account-and-project', 'Loading account')}
      />
    );
  }

  const [projects, me] = query.data;
  // TODO: handle error state.

  const { selectedProject, selectedSubject } = findProjectAndSubjectById(
    selectedId ?? storedProjectIdResult,
    projects,
    me,
  );

  if (!selectedProject || !selectedSubject) {
    return <InviteRequiredScreen />;
  }

  const value: ActiveProjectContextValue = {
    activeProject: selectedProject,
    activeSubjectId: selectedSubject.subjectId,
    activeSubject: selectedSubject,
    setActiveProjectId: (projectId: string) => {
      const result = findProjectAndSubjectById(projectId, projects, me);
      if (result.selectedProject) {
        setSelectedId(result.selectedProject.id);
      }
    },
  };

  return (
    <ActiveProjectContext.Provider value={value}>
      {children}
    </ActiveProjectContext.Provider>
  );
};

export const useActiveProject = () => {
  const value = useContext(ActiveProjectContext);
  if (!value) {
    throw new Error(
      'useActiveProject must be used within an ActiveProjectContextProvider',
    );
  }
  return value;
};

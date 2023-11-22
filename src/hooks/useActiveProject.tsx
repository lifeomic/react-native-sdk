import React, { createContext, useContext, useEffect } from 'react';
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
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Ignoring attempt to set invalid projectId', projectId);
    }
    return getDefault();
  }
  return { selectedProject, selectedSubject };
};

/**
 * Why this file is organized this way:
 *
 * Using a higher-order component here allows us to more easily (and type-safely)
 * model the various network dependencies here. The idea is:
 *
 * - We need to fetch the user's active project + subjects. Do this by using the
 *   `useSubjectProjects` and `useMe` hooks.
 *
 *   -> If the user does not have a project or subject, show the invite required screen.
 *
 * - Once we have all that, we can be sure that this user is ready to go. Render children.
 */

const withRequiredData =
  <Props extends {}>(
    Component: React.FC<
      Props & {
        data: [Project[], Subject[]];
        storedProjectId: string | null | undefined;
        setStoredProjectId: (projectId: string) => void;
      }
    >,
  ): React.FC<Props> =>
  (props) => {
    const query = combineQueries([useSubjectProjects(), useMe(), useUser()]);

    const userId = query.data?.[2]?.id;

    const [storedProjectId, setStoredProjectId, isStorageLoaded] =
      useAsyncStorage(`${selectedProjectIdKey}:${userId}`, !!userId);

    // TODO: handle error state.
    if (query.status !== 'success' || !isStorageLoaded) {
      return (
        <ActivityIndicatorView
          message={t('waiting-for-account-and-project', 'Loading account')}
        />
      );
    }

    const [projects, subjects] = query.data;

    return (
      <Component
        {...props}
        data={[projects, subjects]}
        storedProjectId={storedProjectId}
        setStoredProjectId={setStoredProjectId}
      />
    );
  };

export const ActiveProjectContextProvider: React.FC<{
  children?: React.ReactNode;
}> = withRequiredData(
  ({ data: [projects, me], storedProjectId, setStoredProjectId, children }) => {
    const { selectedProject, selectedSubject } = findProjectAndSubjectById(
      storedProjectId,
      projects,
      me,
    );

    // This effect handles setting the initial value in async storage.
    useEffect(() => {
      if (selectedProject?.id && selectedProject?.id !== storedProjectId) {
        setStoredProjectId(selectedProject.id);
      }
    }, [selectedProject?.id, storedProjectId, setStoredProjectId]);

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
          setStoredProjectId(result.selectedProject.id);
        }
      },
    };

    return (
      <ActiveProjectContext.Provider value={value}>
        {children}
      </ActiveProjectContext.Provider>
    );
  },
);

export const useActiveProject = () => {
  const value = useContext(ActiveProjectContext);
  if (!value) {
    throw new Error(
      'useActiveProject must be used within an ActiveProjectContextProvider',
    );
  }
  return value;
};

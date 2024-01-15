import React, { createContext, useContext, useEffect } from 'react';
import { Subject, useMe } from './useMe';
import { Project, useSubjectProjects } from './useSubjectProjects';
import { useAsyncStorage } from './useAsyncStorage';
import { useUser } from './useUser';
import { combineQueries } from '@lifeomic/one-query';
import { ActivityIndicatorView } from '../components/ActivityIndicatorView';
import { t } from 'i18next';
import { InviteRequiredScreen } from '../screens/InviteRequiredScreen';
import { useRestQuery } from './rest-api';
import { useActiveAccount } from './useActiveAccount';

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

/**
 * Why an HOC:
 *
 * Using a higher-order component here allows us to more easily (and type-safely)
 * model the GET /v1/accounts network dependencies here. The idea is:
 *
 * - Until we're sure the user is in the active account, it is not safe to make other
 *   network requests.
 *   -> (because if they aren't in the account, the request will result in 401)
 *
 * - So, rather than deal with passing a react-query `enabled` setting through the various
 *   project-related network calls, just avoid rendering those hooks entirely until we
 *   know the user is in the right account.
 */

const withAccountRequired =
  <Props extends {}>(Component: React.FC<Props>): React.FC<Props> =>
  (props) => {
    const { account: activeAccountId } = useActiveAccount();
    const query = useRestQuery(
      'GET /v1/accounts',
      {},
      {
        // Do not include account header on this request.
        axios: { headers: { 'LifeOmic-Account': '' } },
      },
    );

    if (query.status !== 'success') {
      return (
        <ActivityIndicatorView
          message={t('waiting-for-account-and-project', 'Loading account')}
        />
      );
    }

    const isMemberOfActiveAccount = query.data.accounts.some(
      (account) => account.id === activeAccountId,
    );

    if (!isMemberOfActiveAccount) {
      return <InviteRequiredScreen />;
    }

    return <Component {...props} />;
  };

type SelectionState =
  | {
      status: 'success';
      activeProject: Project;
      activeSubject: Subject;
      projects: Project[];
      me: Subject[];
    }
  | { status: 'not-a-patient' }
  | { status: 'loading' };

export type ActiveProjectContextProviderProps = {
  children?: React.ReactNode;
};

export const ActiveProjectContextProvider: React.FC<ActiveProjectContextProviderProps> =
  withAccountRequired(({ children }) => {
    const query = combineQueries([useSubjectProjects(), useMe(), useUser()]);
    const userId = query.data?.[2].id;
    const [storedProjectIdResult, setStoredProjectId, isStorageLoaded] =
      useAsyncStorage(
        `${selectedProjectIdKey}:${userId}`,
        !!selectedProjectIdKey && !!userId,
      );

    const calculateState = (): SelectionState => {
      if (!query.data || !isStorageLoaded) {
        return { status: 'loading' };
      }

      const [projects, me] = query.data;

      const { selectedProject, selectedSubject } = findProjectAndSubjectById(
        storedProjectIdResult,
        projects,
        me,
      );

      if (!selectedProject || !selectedSubject) {
        return { status: 'not-a-patient' };
      }

      return {
        status: 'success',
        activeProject: selectedProject,
        activeSubject: selectedSubject,
        projects,
        me,
      };
    };

    const state = calculateState();

    // This effect handles setting the initial value in async storage.
    const activeProjectId =
      state.status === 'success' ? state.activeProject.id : undefined;
    useEffect(() => {
      if (activeProjectId && activeProjectId !== storedProjectIdResult) {
        setStoredProjectId(activeProjectId);
      }
    }, [activeProjectId, storedProjectIdResult, setStoredProjectId]);

    if (state.status === 'loading') {
      return (
        <ActivityIndicatorView
          message={t('waiting-for-account-and-project', 'Loading account')}
        />
      );
    }
    // TODO: handle error state.
    if (state.status === 'not-a-patient') {
      return <InviteRequiredScreen />;
    }

    const value: ActiveProjectContextValue = {
      activeProject: state.activeProject,
      activeSubjectId: state.activeSubject.subjectId,
      activeSubject: state.activeSubject,
      setActiveProjectId: (projectId: string) => {
        const result = findProjectAndSubjectById(
          projectId,
          state.projects,
          state.me,
        );

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
  });

export const useActiveProject = () => {
  const value = useContext(ActiveProjectContext);
  if (!value) {
    throw new Error(
      'useActiveProject must be used within an ActiveProjectContextProvider',
    );
  }
  return value;
};

import React, {
  createContext,
  useEffect,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { Account, Subject, Entry, User, SubjectConfig } from '../types';
import { useAsyncStorage } from './useAsyncStorage';
import { useHttpClient } from './useHttpClient';
import { APIClient } from '@lifeomic/one-query';
import { RestAPIEndpoints } from '../types/rest-types';
import { useAuth } from './useAuth';

type Configuration = {
  account: string;
  subjectConfigs: SubjectConfig[];
};

type UserConfiguration = {
  sessionTime: string;
  user: User;
  accounts: Account[];
  configurations: Configuration[];
};

type UserConfigurationsContextProps = {
  userConfiguration: UserConfiguration;
  isLoaded: boolean;
  clearSession: () => void;
};

enum Session {
  placeholder = 'placeholder',
}

const configurationPlaceholder: UserConfiguration = {
  user: {
    id: Session.placeholder,
    profile: {
      email: Session.placeholder,
    },
  },
  configurations: [],
  accounts: [],
  sessionTime: new Date().toISOString(),
};

export const SessionContext = createContext({
  userConfiguration: configurationPlaceholder,
  isLoaded: false,
} as UserConfigurationsContextProps);

export const userSessionKey = 'storedSession';

/**
 * Uses stored session context to populate infrequently changing values
 * such as user, account, subjects, projects, and appConfig to improve app loading performance.
 * A new session is queried for when:
 * - No existing session is found in storage
 * - After a session is greater than 7 days old
 * - An new project invite is accepted
 * - On logout
 * - The Clear Session button on the settings screen is pressed (__DEV__ only)
 */
export const SessionContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userSessionInfo, setUserSessionInfo, isStorageLoaded, _, clearItem] =
    useAsyncStorage(userSessionKey);
  const { authResult } = useAuth();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { apiClient } = useHttpClient();
  const userConfiguration = useMemo(
    () =>
      userSessionInfo
        ? (JSON.parse(userSessionInfo) as UserConfiguration)
        : configurationPlaceholder,
    [userSessionInfo],
  );

  const fetchNewSession = useCallback(async () => {
    const fetchedSessionInfo = await fetchAllUserSessionInfo(apiClient);
    setUserSessionInfo(JSON.stringify(fetchedSessionInfo));
    setIsLoaded(true);
  }, [apiClient, setUserSessionInfo]);

  useEffect(() => {
    if (isStorageLoaded && !!authResult?.accessToken) {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      if (
        !userSessionInfo ||
        new Date(userConfiguration.sessionTime) < lastWeek
      ) {
        __DEV__ &&
          console.info(
            'No session detected or session expired, loading new session',
          );
        fetchNewSession();
      } else {
        setIsLoaded(true);
      }
    }
  }, [
    apiClient,
    authResult?.accessToken,
    fetchNewSession,
    isStorageLoaded,
    setUserSessionInfo,
    userConfiguration.sessionTime,
    userSessionInfo,
  ]);

  const clearSession = useCallback(() => {
    setIsLoaded(false);
    clearItem();
  }, [clearItem]);

  return (
    <SessionContext.Provider
      value={{
        userConfiguration: userConfiguration,
        isLoaded:
          isLoaded && userConfiguration?.user.id !== Session.placeholder,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

const filterNonLRAccounts = (accounts?: Account[]) =>
  accounts?.filter((a) => a.products?.indexOf('LR') > -1) || [];

const fetchAllUserSessionInfo = async (
  apiClient: APIClient<RestAPIEndpoints>,
): Promise<UserConfiguration> => {
  const user = await apiClient.request('GET /v1/user', {});
  const accounts = await apiClient.request('GET /v1/accounts', {});
  const accountsWithProduct = filterNonLRAccounts(accounts.data.accounts);
  const configurations = await Promise.all(
    accountsWithProduct.map(async (account) => {
      const accountHeader = { 'LifeOmic-Account': account.id };
      const useMeResponse = await apiClient.request(
        'GET /v1/fhir/dstu3/$me',
        {},
        { headers: accountHeader },
      );
      const subjects = patientsToSubjects(useMeResponse.data.entry);
      const subjectConfigs = await Promise.all(
        subjects.map(async (subject) => {
          const projectResponse = await apiClient.request(
            'GET /v1/projects',
            {
              id: subject.projectId,
            },
            { headers: accountHeader },
          );
          const project = projectResponse.data.items[0];
          const appConfig = await apiClient.request(
            'GET /v1/life-research/projects/:projectId/app-config',
            {
              projectId: project.id,
            },
            { headers: accountHeader },
          );

          return {
            subject,
            project,
            appConfig: appConfig.data,
          };
        }),
      );

      return {
        account: account.id,
        subjectConfigs: subjectConfigs,
      };
    }),
  );

  return {
    user: user.data,
    accounts: accountsWithProduct,
    configurations,
    sessionTime: new Date().toISOString(),
  };
};

const patientsToSubjects = (entries: Entry[]) => {
  return entries?.map(
    (entry) =>
      ({
        subjectId: entry.resource.id,
        projectId: entry.resource.meta?.tag?.find(
          (t) => t.system === 'http://lifeomic.com/fhir/dataset',
        )?.code,
        name: entry.resource.name,
      } as Subject),
  );
};

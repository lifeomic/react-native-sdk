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
import { SubjectConfig } from '../types';

const selectedProjectIdKey = 'selectedProjectIdKey';
type ActiveConfig = SubjectConfig;
export type ActiveConfigContextProps = ActiveConfig & {
  selectConfigByProjectId: (projectId: string) => void;
  isLoading: boolean;
};

export const ActiveConfigContext = createContext({
  selectConfigByProjectId: () => Promise.reject(),
  isLoading: true,
} as ActiveConfigContextProps);

export const ActiveConfigContextProvider = ({
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
  const hookReturnValue = useMemo<ActiveConfig | undefined>(() => {
    if (!isLoaded || !isStorageLoaded) {
      return undefined;
    }

    const projectToSelect = selectedId ?? storedProjectIdResult;
    const subjectConfig = projectToSelect
      ? configuration?.subjectConfigs.find(
          ({ subject }) => subject?.projectId === projectToSelect,
        )
      : configuration?.subjectConfigs[0];

    return subjectConfig;
  }, [
    isLoaded,
    isStorageLoaded,
    selectedId,
    storedProjectIdResult,
    configuration?.subjectConfigs,
  ]);

  useEffect(() => {
    if (hookReturnValue?.subject?.projectId) {
      setStoredProjectId(hookReturnValue?.subject?.projectId);
    }
  }, [hookReturnValue, setStoredProjectId]);

  const selectConfigByProjectId = useCallback(
    (projectId: string) => {
      const subjectConfig = configuration?.subjectConfigs.find(
        ({ subject }) => subject?.projectId === projectId,
      );

      if (subjectConfig) {
        setSelectedId(subjectConfig.subject?.projectId);
      }
    },
    [configuration?.subjectConfigs],
  );

  return (
    <ActiveConfigContext.Provider
      value={{
        ...hookReturnValue,
        selectConfigByProjectId: selectConfigByProjectId,
        isLoading: !isLoaded || !isStorageLoaded,
      }}
    >
      {children}
    </ActiveConfigContext.Provider>
  );
};

export const useActiveConfig = () => useContext(ActiveConfigContext);

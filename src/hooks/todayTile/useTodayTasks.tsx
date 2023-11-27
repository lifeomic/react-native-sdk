import { useCallback } from 'react';
import { useGraphQLClient } from '../useGraphQLClient';
import { gql } from 'graphql-request';
import { useActiveAccount } from '../useActiveAccount';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActiveProject } from '../useActiveProject';
import { useRestQuery, useRestCache } from '../rest-api';
import { ConsentTask, SurveyResponse } from './types';

export type TodayTask = SurveyResponse | ConsentTask;
export function isConsentTask(value: TodayTask): value is ConsentTask {
  return !!(value as ConsentTask).form;
}

export const useInvalidateTodayCountCache = () => {
  const restCache = useRestCache();
  const queryClient = useQueryClient();

  // We wait 3.5 seconds by default to give the backend a chance to update
  return useCallback(
    (delay = 3500) => {
      setTimeout(() => {
        restCache.invalidateQueries({
          'GET /v1/consent/directives/me': 'all',
          'GET /v1/survey/projects/:projectId/responses': 'all',
        });

        queryClient.refetchQueries(['getIncompleteActivitiesCount']);
      }, delay);
    },
    [restCache, queryClient],
  );
};

const useConsentTasks = () => {
  const { activeProject } = useActiveProject();
  const { accountHeaders } = useActiveAccount();

  return useRestQuery(
    'GET /v1/consent/directives/me',
    {
      projectId: activeProject?.id!,
      includeForm: true,
    },
    {
      axios: { headers: accountHeaders },
      select: (data) => data.items,
    },
  );
};

type SurveyResponseInput = {
  includeSurveyName?: boolean;
  status?: string;
  pageSize?: number;
};

export const useGetSurveyResponsesForProject = (
  input?: SurveyResponseInput,
) => {
  const { activeSubjectId, activeProject } = useActiveProject();
  const { accountHeaders } = useActiveAccount();

  return useRestQuery(
    'GET /v1/survey/projects/:projectId/responses',
    {
      projectId: activeProject.id,
      author: activeSubjectId,
      patientId: activeSubjectId,
      includeSurveyName: input?.includeSurveyName ?? false,
      status: input?.status ?? 'in-progress',
      pageSize: input?.pageSize ?? 100,
    },
    {
      axios: { headers: accountHeaders },
      select: (data) => data.items,
    },
  );
};

type GetIncompleteActivitiesCountQueryResponse = {
  __typename: 'Query';
  getIncompleteActivitiesCount: number;
};

const GetIncompleteActivitiesCount = gql`
  query GetIncompleteActivitiesCount {
    getIncompleteActivitiesCount
  }
`;

export const useGetIncompleteActivitiesCount = () => {
  const { graphQLClient } = useGraphQLClient();
  const { accountHeaders } = useActiveAccount();

  const queryForPostDetails = useCallback(async () => {
    return graphQLClient.request<GetIncompleteActivitiesCountQueryResponse>(
      GetIncompleteActivitiesCount,
      undefined,
      accountHeaders,
    );
  }, [accountHeaders, graphQLClient]);

  return useQuery(['getIncompleteActivitiesCount'], queryForPostDetails);
};

export const useTodayTasks = () => {
  const {
    data: consentTasks,
    isInitialLoading: loadingConsents,
    refetch: refetchConsents,
  } = useConsentTasks();
  const {
    data: surveyTasks,
    isInitialLoading: loadingSurveys,
    refetch: refetchSurveys,
  } = useGetSurveyResponsesForProject();
  const { data, isInitialLoading, refetch } = useGetIncompleteActivitiesCount();

  const inProgressConsentTasks =
    consentTasks?.filter((task) => task.status === 'proposed') ?? [];
  const inProgressSurveyTasks =
    surveyTasks?.filter((task) => task.status === 'in-progress') ?? [];
  const newTasks = [
    ...inProgressConsentTasks,
    ...inProgressSurveyTasks,
  ] as TodayTask[];

  return {
    loading: loadingConsents || loadingSurveys || isInitialLoading,
    newTasks,
    incompleteActivitiesCount: data?.getIncompleteActivitiesCount,
    refetch: useCallback(() => {
      refetchConsents();
      refetchSurveys();
      refetch();
    }, [refetchConsents, refetchSurveys, refetch]),
  };
};

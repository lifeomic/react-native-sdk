import { useCallback } from 'react';
import { useGraphQLClient } from '../useGraphQLClient';
import { gql } from 'graphql-request';
import { useActiveAccount } from '../useActiveAccount';
import { useQuery } from '@tanstack/react-query';
import { useActiveProject } from '../useActiveProject';
import { useRestQuery } from '../rest-api';
import { ConsentTask, SurveyResponse } from './types';

export type TodayTask = SurveyResponse | ConsentTask;
export function isConsentTask(value: TodayTask): value is ConsentTask {
  return !!(value as ConsentTask).form;
}

const useConsentTasks = () => {
  const { activeSubject } = useActiveProject();
  const { accountHeaders } = useActiveAccount();

  return useRestQuery(
    'GET /v1/consent/directives/me',
    {
      projectId: activeSubject?.projectId!,
      includeForm: true,
    },
    {
      enabled: !!accountHeaders && !!activeSubject?.projectId,
      axios: { headers: accountHeaders },
      select: (data) => data.items,
    },
  );
};

const useGetSurveyResponsesForProject = () => {
  const { activeSubject } = useActiveProject();
  const { accountHeaders } = useActiveAccount();

  return useRestQuery(
    'GET /v1/survey/projects/:projectId/responses',
    {
      projectId: activeSubject?.projectId!,
      author: activeSubject?.subjectId!,
      patientId: activeSubject?.subjectId!,
      includeSurveyName: false,
      status: 'in-progress',
      pageSize: 100,
    },
    {
      enabled:
        !!accountHeaders &&
        !!activeSubject?.projectId &&
        !!activeSubject?.subjectId,
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
  const { isLoading, accountHeaders } = useActiveAccount();

  const queryForPostDetails = useCallback(async () => {
    return graphQLClient.request<GetIncompleteActivitiesCountQueryResponse>(
      GetIncompleteActivitiesCount,
      undefined,
      accountHeaders,
    );
  }, [accountHeaders, graphQLClient]);

  return useQuery(['getIncompleteActivitiesCount'], queryForPostDetails, {
    enabled: !isLoading && !!accountHeaders,
  });
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

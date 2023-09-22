import { useCallback } from 'react';
import { useGraphQLClient } from '../useGraphQLClient';
import { gql } from 'graphql-request';
import { useActiveAccount } from '../useActiveAccount';
import { useQuery } from '@tanstack/react-query';
import { useActiveConfig } from '../useActiveConfig';
import { useRestQuery } from '../rest-api';
import { ConsentTask, SurveyResponse } from './types';

export type TodayTask = SurveyResponse | ConsentTask;
export function isConsentTask(value: TodayTask): value is ConsentTask {
  return !!(value as ConsentTask).form;
}

const useConsentTasks = () => {
  const { subject } = useActiveConfig();
  const { accountHeaders } = useActiveAccount();

  return useRestQuery(
    'GET /v1/consent/directives/me',
    {
      projectId: subject?.projectId!,
      includeForm: true,
    },
    {
      enabled: !!accountHeaders && !!subject?.projectId,
      axios: { headers: accountHeaders },
      select: (data) => data.items,
    },
  );
};

const useGetSurveyResponsesForProject = () => {
  const { subject } = useActiveConfig();
  const { accountHeaders } = useActiveAccount();

  return useRestQuery(
    'GET /v1/survey/projects/:projectId/responses',
    {
      projectId: subject?.projectId!,
      author: subject?.subjectId!,
      patientId: subject?.subjectId!,
      includeSurveyName: false,
      status: 'in-progress',
      pageSize: 100,
    },
    {
      enabled: !!accountHeaders && !!subject?.projectId && !!subject?.subjectId,
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

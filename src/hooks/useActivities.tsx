import { useCallback } from 'react';
import { gql } from 'graphql-request';
import { useGraphQLClient } from './useGraphQLClient';
import { useActiveAccount } from './useActiveAccount';
import { useQuery } from '@tanstack/react-query';

const getActivitiesQueryDocument = gql`
  query GetAllActivities($input: GetAllActivitiesInput!) {
    getAllActivities(input: $input) {
      edges {
        node {
          ...FullActivity
          __typename
        }
        __typename
      }
      __typename
    }
  }

  fragment FullActivity on Activity {
    account
    activityType {
      value
      __typename
    }
    activityVerb {
      value
      __typename
    }
    assignmentDateTime
    completionDateTime
    id
    isFavorite
    deepLink {
      value {
        ...FullDeepLink
        __typename
      }
      __typename
    }
    description {
      value
      __typename
    }
    descriptionMedia {
      value {
        ...FullCourseDescriptionMedia
        __typename
      }
      __typename
    }
    displayName
    fields {
      ...FullActivityFields
      __typename
    }
    project
    slug
    status
    timeEstimate {
      value {
        value
        unit
        __typename
      }
      __typename
    }
    timeOfDay {
      value
      __typename
    }
    ... on CourseActivity {
      programSlug {
        value
        __typename
      }
      courseSlug {
        value
        __typename
      }
      __typename
    }
    __typename
  }

  fragment FullDeepLink on DeepLink {
    id
    type
    url
    __typename
  }

  fragment FullCourseDescriptionMedia on CourseActivityDescriptionMedia {
    id
    type
    url
    __typename
  }

  fragment FullActivityFields on ActivityFields {
    ...FullArticleActivityFields
    ...FullAudioActivityFields
    ...FullLifeologyActivityFields
    ...FullObservationActivityFields
    ...FullProcedureActivityFields
    ...FullProvideActivityFields
    ...FullQuoteActivityFields
    ...FullSocialPostActivityFields
    ...FullSurveyActivityFields
    ...FullVideoActivityFields
    ...FullCastActivityFields
    ...FullMedicationActivityFields
    ...FullMetricActivityFields
    ...FullManualCustomActivityFields
    __typename
  }

  fragment FullArticleActivityFields on ArticleActivityFields {
    articleUrl {
      value
      __typename
    }
    __typename
  }

  fragment FullAudioActivityFields on AudioActivityFields {
    audioUrl {
      value
      __typename
    }
    __typename
  }

  fragment FullLifeologyActivityFields on LifeologyActivityFields {
    achievement {
      value
      __typename
    }
    imageUrl {
      value
      __typename
    }
    url {
      value
      __typename
    }
    __typename
  }

  fragment FullObservationActivityFields on ObservationActivityFields {
    coding {
      value
      __typename
    }
    valueQuantity {
      value
      __typename
    }
    __typename
  }

  fragment FullProcedureActivityFields on ProcedureActivityFields {
    coding {
      value
      __typename
    }
    duration {
      value
      __typename
    }
    __typename
  }

  fragment FullProvideActivityFields on ProvideActivityFields {
    formLabels {
      value
      __typename
    }
    __typename
  }

  fragment FullQuoteActivityFields on QuoteActivityFields {
    author {
      value
      __typename
    }
    __typename
  }

  fragment FullSocialPostActivityFields on SocialPostActivityFields {
    postId {
      value
      __typename
    }
    __typename
  }

  fragment FullSurveyActivityFields on SurveyActivityFields {
    surveyId {
      value
      __typename
    }
    __typename
  }

  fragment FullVideoActivityFields on VideoActivityFields {
    imageUrl {
      value
      __typename
    }
    youtubeVideoId {
      value
      __typename
    }
    videoUrl: url {
      value
      __typename
    }
    __typename
  }

  fragment FullCastActivityFields on CastActivityFields {
    options {
      value {
        label
        id
        __typename
      }
      __typename
    }
    __typename
  }

  fragment FullMedicationActivityFields on MedicationActivityFields {
    coding {
      value
      __typename
    }
    medicationInstructions {
      value {
        id
        time {
          value
          __typename
        }
        dosage {
          value
          __typename
        }
        __typename
      }
      __typename
    }
    medicationInstructionId
    __typename
  }

  fragment FullMetricActivityFields on MetricActivityFields {
    coding {
      value
      __typename
    }
    customActivityVerb {
      value
      __typename
    }
    target {
      value
      __typename
    }
    unit {
      value
      __typename
    }
    sdkIconKey {
      value
      __typename
    }
    metricId {
      value
      __typename
    }
    color {
      value
      __typename
    }
    __typename
  }

  fragment FullManualCustomActivityFields on ManualCustomActivityFields {
    customActivityVerb {
      value
      __typename
    }
    icon {
      value
      __typename
    }
    color {
      value
      __typename
    }
    __typename
  }
`;

type ActivitiesInput = {
  status?: string;
  startDateTime?: string;
  endDateTime: string;
};

type ActivitiesQueryResponse = {
  getAllActivities: {
    edges: {
      node: {
        id: string;
        slug: string;
        displayName: string;
        activityType: {
          value: string;
        };
        assignmentDateTime: string;
        completionDateTime: string;
        status: string;
        timeOfDay: {
          value: string;
        };
        programSlug: {
          value: string;
        };
        courseSlug: {
          value: string;
        };
        fields: {
          imageUrl?: string | null;
          videoUrl?: {
            value: string;
          };
          youtubeVideoId?: {
            value: string;
          };
        };
      };
    }[];
  };
};

export const useActivities = (input: ActivitiesInput) => {
  const { graphQLClient } = useGraphQLClient();
  const { isFetched, accountHeaders } = useActiveAccount();

  const queryForActivities = useCallback(async () => {
    return graphQLClient.request<ActivitiesQueryResponse>(
      getActivitiesQueryDocument,
      {
        input,
      },
      accountHeaders,
    );
  }, [accountHeaders, graphQLClient, input]);

  return useQuery(['activities'], queryForActivities, {
    enabled: isFetched && !!accountHeaders,
  });
};

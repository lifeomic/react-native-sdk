import { useActiveProject } from './useActiveProject';
import { Consent, Questionnaire } from 'fhir/r3';
import {
  useRestQuery,
  useRestMutation,
  useRestCache,
  Endpoints,
} from './rest-api';
import { RestAPIEndpoints } from '@lifeomic/react-client';
import { RequestPayloadOf } from '@lifeomic/one-query';
import {
  UseMutationResult,
  UseQueryResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ACTIVITIES_QUERY_KEY } from './useActivities';
import cloneDeep from 'lodash/cloneDeep';
import { useDeveloperConfig } from './useDeveloperConfig';
import { useEffect } from 'react';

type PatchConsentDirectives =
  RestAPIEndpoints['PATCH /v1/consent/directives/me/:directiveId'];

export const createConsentPatch = (
  directiveId: string,
  accept: boolean,
): RequestPayloadOf<
  RestAPIEndpoints,
  'PATCH /v1/consent/directives/me/:directiveId'
> => ({
  directiveId,
  status: accept ? 'active' : 'rejected',
  response: {
    item: [
      { linkId: 'terms' },
      { linkId: 'acceptance', answer: [{ valueBoolean: accept }] },
    ],
  },
});

export const useConsent = () => {
  const queryClient = useQueryClient();
  const { activeProject } = useActiveProject();
  const cache = useRestCache();

  const useConsentDirectives = () => {
    return useRestQuery('GET /v1/consent/directives/me', {
      projectId: activeProject.id,
      includeForm: true,
    });
  };

  const useUpdateProjectConsentDirective = (options?: {
    onSuccess?: (
      data: PatchConsentDirectives['Response'],
      variables: PatchConsentDirectives['Request'] & {
        directiveId: string;
      },
    ) => Promise<void> | void;
  }) => {
    return useRestMutation('PATCH /v1/consent/directives/me/:directiveId', {
      onSuccess: async (data, variables) => {
        /**
         * Accepting a consent can change the activities that are
         * available to the user. So, trigger a refetch of activities
         * on acceptance.
         */
        queryClient.resetQueries({ queryKey: ACTIVITIES_QUERY_KEY });
        await options?.onSuccess?.(data, variables);

        /**
         * Update consent status in cache following a successful mutation
         */
        cache.updateCache(
          'GET /v1/consent/directives/me',
          { projectId: activeProject.id, includeForm: true },
          (currentData) => {
            if (!currentData) {
              return currentData!;
            }
            const newData = cloneDeep(currentData);
            for (const consent of newData?.items) {
              if (consent.id === variables.directiveId) {
                consent.status = variables.status;
              }
            }

            return newData!;
          },
        );
      },
    });
  };

  const useShouldRenderConsentScreen = () => {
    const {
      data: directivesData,
      isLoading: loadingDirectives,
      isFetched: fetchedDirectives,
      refetch: refetchDirectives,
      isRefetching: refetchingDirectives,
    } = useConsentDirectives();
    const { activeConsentRequired } = useDeveloperConfig();
    const activeConsents = directivesData?.items?.filter(
      (c) => c.status === 'active',
    );
    const hasActiveConsent = !!activeConsents?.length;
    const consentDirectives = directivesData?.items?.filter(
      (c) => c.status === 'proposed' || c.status === 'rejected',
    );
    const shouldRenderConsentScreen = !!consentDirectives?.length;
    const consentCheckNotSatisfied =
      activeConsentRequired && !hasActiveConsent && !shouldRenderConsentScreen;

    useEffect(() => {
      const intervalId = setInterval(() => {
        if (consentCheckNotSatisfied && !refetchingDirectives) {
          refetchDirectives();
        } else {
          clearInterval(intervalId);
        }
      }, 2000);

      return () => clearInterval(intervalId);
    }, [consentCheckNotSatisfied, refetchDirectives, refetchingDirectives]);

    return {
      isLoading:
        !fetchedDirectives || loadingDirectives || consentCheckNotSatisfied,
      consentDirectives,
      shouldRenderConsentScreen,
    };
  };

  return {
    useConsentDirectives,
    useUpdateProjectConsentDirective,
    useShouldRenderConsentScreen,
  } as {
    useConsentDirectives: () => UseQueryResult<{
      items: ConsentAndForm[];
    }>;
    useUpdateProjectConsentDirective: (
      options?:
        | {
            onSuccess?:
              | ((
                  data: PatchConsentDirectives['Response'],
                  variables: PatchConsentDirectives['Request'] & {
                    directiveId: string;
                  },
                ) => Promise<void> | void)
              | undefined;
          }
        | undefined,
    ) => UseMutationResult<
      {},
      unknown,
      RequestPayloadOf<
        Endpoints,
        'PATCH /v1/consent/directives/me/:directiveId'
      >
    >;
    useShouldRenderConsentScreen: () => {
      isLoading: boolean;
      consentDirectives: ConsentAndForm[] | undefined;
      shouldRenderConsentScreen: boolean;
      hasActiveConsent: boolean;
      refetchDirectives: () => void;
    };
  };
};

export type ConsentAndForm = Consent & {
  form: Questionnaire;
};

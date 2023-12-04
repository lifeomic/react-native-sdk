import { useActiveProject } from './useActiveProject';
import { Consent, Questionnaire } from 'fhir/r3';
import { useRestQuery, useRestMutation } from './rest-api';
import { RestAPIEndpoints } from '../types/rest-types';
import { RequestPayloadOf } from '@lifeomic/one-query';
import { useQueryClient } from '@tanstack/react-query';
import { ACTIVITIES_QUERY_KEY } from './useActivities';

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
        queryClient.resetQueries({ queryKey: ACTIVITIES_QUERY_KEY });
        await options?.onSuccess?.(data, variables);
      },
    });
  };

  const useShouldRenderConsentScreen = () => {
    const {
      data: directivesData,
      isLoading: loadingDirectives,
      isFetched: fetchedDirectives,
    } = useConsentDirectives();

    const consentDirectives = directivesData?.items?.filter(
      (c) => c.status === 'proposed' || c.status === 'rejected',
    );
    const shouldRenderConsentScreen = !!consentDirectives?.length;

    return {
      isLoading: !fetchedDirectives || loadingDirectives,
      consentDirectives,
      shouldRenderConsentScreen,
    };
  };

  return {
    useConsentDirectives,
    useUpdateProjectConsentDirective,
    useShouldRenderConsentScreen,
  };
};

export type ConsentAndForm = Consent & {
  form: Questionnaire;
};

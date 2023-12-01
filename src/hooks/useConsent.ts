import { useActiveProject } from './useActiveProject';
import { Consent, Questionnaire } from 'fhir/r3';
import { useRestQuery, useRestMutation } from './rest-api';
import { RestAPIEndpoints } from '../types/rest-types';

export const useConsent = () => {
  const { activeProject } = useActiveProject();

  const useConsentDirectives = () => {
    return useRestQuery('GET /v1/consent/directives/me', {
      projectId: activeProject.id,
      includeForm: true,
    });
  };

  const useUpdateProjectConsentDirective = () => {
    const mutation = useRestMutation(
      'PATCH /v1/consent/directives/me/:directiveId',
    );

    const getInput = ({ directiveId, accept }: ConsentPatch) => {
      const status: 'active' | 'rejected' = accept ? 'active' : 'rejected';
      return {
        directiveId,
        status,
        response: {
          item: [
            {
              linkId: 'terms',
            },
            {
              linkId: 'acceptance',
              answer: [
                {
                  valueBoolean: accept,
                },
              ],
            },
          ],
        },
      } as RestAPIEndpoints['PATCH /v1/consent/directives/me/:directiveId']['Request'] & {
        directiveId: string;
      };
    };

    return {
      ...mutation,
      mutate: (values: ConsentPatch) => mutation.mutate(getInput(values)),
      mutateAsync: (values: ConsentPatch) =>
        mutation.mutateAsync(getInput(values)),
    };
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

type ConsentPatch = {
  directiveId: string;
  accept: boolean;
};

export type ConsentAndForm = Consent & {
  form: Questionnaire;
};

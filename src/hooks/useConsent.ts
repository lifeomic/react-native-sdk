import { useQuery, useMutation } from '@tanstack/react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { useActiveProject } from './useActiveProject';
import { Consent, Questionnaire } from 'fhir/r3';

export const useConsent = () => {
  const { accountHeaders, account } = useActiveAccount();
  const { activeProject } = useActiveProject();
  const { httpClient } = useHttpClient();

  const useConsentDirectives = () => {
    return useQuery(
      [
        '/v1/consent/directives/me',
        {
          account,
          projectId: activeProject?.id,
          accountHeaders,
        },
      ],
      () =>
        httpClient
          .get<{ items: ConsentAndForm[] }>('/v1/consent/directives/me', {
            params: { projectId: activeProject?.id, includeForm: true },
            headers: { ...accountHeaders },
          })
          .then((res) => res.data),
      { enabled: !!accountHeaders && !!activeProject?.id },
    );
  };

  const useUpdateProjectConsentDirective = () => {
    return useMutation({
      mutationFn: async (params: ConsentPatch) =>
        httpClient.patch(
          `/v1/consent/directives/me/${params.directiveId}`,
          {
            status: params.accept ? 'active' : 'rejected',
            response: {
              item: [
                {
                  linkId: 'terms',
                },
                {
                  linkId: 'acceptance',
                  answer: [
                    {
                      valueBoolean: params.accept,
                    },
                  ],
                },
              ],
            },
          },
          {
            headers: { ...accountHeaders },
          },
        ),
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

type ConsentPatch = {
  directiveId: string;
  accept: boolean;
};

type ConsentAndForm = Consent & {
  form: Questionnaire;
};

import { useQuery, useMutation } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useHttpClient } from './useHttpClient';
import { useActiveProject } from './useActiveProject';
import { Consent } from 'fhir/r3';

export const useConsent = () => {
  const { accountHeaders, account } = useActiveAccount();
  const { activeProject } = useActiveProject();
  const { httpClient } = useHttpClient();

  const useDefaultConsent = () => {
    return useQuery(
      [
        `/v1/consent/projects/${activeProject?.id}/default-form`,
        {
          projectId: activeProject?.id,
          account,
        },
      ],
      () =>
        httpClient
          .get<Consent & { item: any[] }>(
            `/v1/consent/projects/${activeProject?.id}/default-form`,
            {
              params: { active: true },
              headers: { ...accountHeaders },
            },
          )
          .then((res) => res.data),
      { enabled: !!accountHeaders && !!activeProject?.id },
    );
  };

  const useConsentDirectives = () => {
    return useQuery(
      [
        '/v1/consent/directives/me',
        {
          account,
          projectId: activeProject?.id,
        },
      ],
      () =>
        httpClient
          .get<{ items: Consent[] }>('/v1/consent/directives/me', {
            params: { projectId: activeProject?.id, includeForm: true },
            headers: { ...accountHeaders },
          })
          .then((res) => res.data),
      { enabled: !!accountHeaders && !!activeProject?.id },
    );
  };

  const useUpdateProjectConsentDirective = () => {
    return useMutation({
      mutationFn: async (accept: boolean) =>
        httpClient.post(
          '/v1/consent/directives/me',
          {
            projectId: activeProject?.id,
            status: accept ? 'active' : 'rejected',
            consentForm: {
              item: [
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
          },
          {
            headers: { ...accountHeaders },
          },
        ),
    });
  };

  const useShouldRenderConsentScreen = () => {
    const { data: directivesData, isLoading: loadingDirectives } =
      useConsentDirectives();
    const { data: defaultConsentData, isLoading: loadingDefaultConsents } =
      useDefaultConsent();

    const didAcceptConsent =
      !loadingDirectives &&
      directivesData &&
      directivesData.items.length > 0 &&
      directivesData.items[0].status === 'active';

    const hasConsent = !loadingDefaultConsents && !!defaultConsentData;

    return {
      isLoading: loadingDirectives || loadingDefaultConsents,
      shouldRenderConsentScreen: hasConsent && !didAcceptConsent,
    };
  };

  return {
    useConsentDirectives,
    useDefaultConsent,
    useUpdateProjectConsentDirective,
    useShouldRenderConsentScreen,
  };
};

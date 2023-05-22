import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useConsent } from './useConsent';
import { useHttpClient } from './useHttpClient';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useActiveAccount } from './useActiveAccount';
import { useActiveProject } from './useActiveProject';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('./useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const useHttpClientMock = useHttpClient as jest.Mock;

const renderHookInContext = (useHook: Function) => {
  return renderHook(() => useHook(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
};

const axiosInstance = axios.create();
const axiosMock = new MockAdapter(axiosInstance);

const activeProject = { id: 'projectId' };

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    accountHeaders: { 'LifeOmic-Account': 'acct1' },
  });
  useActiveProjectMock.mockReturnValue({
    activeProject,
    activeSubjectId: 'subjectId',
  });
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
  axiosMock.reset();
});

describe('useDefaultConsent', () => {
  test('returns the default consent', async () => {
    const consent = {
      title: 'Consent Title',
      resourceType: 'Questionnaire',
      id: 'consentId',
      status: 'active',
    };

    axiosMock
      .onGet(`/v1/consent/projects/${activeProject.id}/default-form`)
      .reply(200, consent);

    const useTestHook = () => {
      const { useDefaultConsent } = useConsent();
      return useDefaultConsent();
    };

    const { result } = renderHookInContext(useTestHook);

    expect(axiosMock.history.get[0].url).toBe(
      `/v1/consent/projects/${activeProject.id}/default-form`,
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(consent);
    });
  });
});

describe('useConsentDirectives', () => {
  test("returns the user's consent directives", async () => {
    const directive = {
      title: 'Directive',
      resourceType: 'Consent',
      id: 'directiveId',
      status: 'active',
    };

    const responseMock = { items: [directive] };
    axiosMock.onGet(`/v1/consent/directives/me`).reply(200, responseMock);

    const useTestHook = () => {
      const { useConsentDirectives } = useConsent();
      return useConsentDirectives();
    };

    const { result } = renderHookInContext(useTestHook);

    expect(axiosMock.history.get[0].url).toBe(`/v1/consent/directives/me`);

    await waitFor(() => {
      expect(result.current.data).toEqual(responseMock);
    });
  });
});

describe('useUpdateProjectConsentDirective', () => {
  test('updates the accepted consent', async () => {
    axiosMock.onPost('/v1/consent/directives/me').reply(201, {});

    const useTestHook = () => {
      const { useUpdateProjectConsentDirective } = useConsent();
      return useUpdateProjectConsentDirective();
    };

    const { result } = renderHookInContext(useTestHook);
    await act(async () => {
      await result.current.mutateAsync(true);
    });

    expect(axiosMock.history.post[0].url).toBe(`/v1/consent/directives/me`);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      projectId: activeProject?.id,
      status: 'active',
      consentForm: {
        item: [
          {
            linkId: 'acceptance',
            answer: [
              {
                valueBoolean: true,
              },
            ],
          },
        ],
      },
    });
  });

  test('updates the rejected consent', async () => {
    axiosMock.onPost('/v1/consent/directives/me').reply(201, {});

    const useTestHook = () => {
      const { useUpdateProjectConsentDirective } = useConsent();
      return useUpdateProjectConsentDirective();
    };

    const { result } = renderHookInContext(useTestHook);
    await act(async () => {
      await result.current.mutateAsync(false);
    });

    expect(axiosMock.history.post[0].url).toBe(`/v1/consent/directives/me`);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      projectId: activeProject?.id,
      status: 'rejected',
      consentForm: {
        item: [
          {
            linkId: 'acceptance',
            answer: [
              {
                valueBoolean: false,
              },
            ],
          },
        ],
      },
    });
  });
});

describe('useShouldRenderConsentScreen', () => {
  test('should return false if the project does not have a default consent form', async () => {
    axiosMock
      .onGet(`/v1/consent/projects/${activeProject.id}/default-form`)
      .reply(200, undefined);

    const directive = {
      title: 'Directive',
      resourceType: 'Consent',
      id: 'directiveId',
      status: 'active',
    };
    const responseMock = { items: [directive] };

    axiosMock.onGet(`/v1/consent/directives/me`).reply(200, responseMock);

    const useTestHook = () => {
      const { useShouldRenderConsentScreen } = useConsent();
      return useShouldRenderConsentScreen();
    };

    const { result } = renderHookInContext(useTestHook);

    await waitFor(() => {
      expect(result.current.shouldRenderConsentScreen).toBe(false);
    });
  });

  test('should return false if the user accepted the consent', async () => {
    const consent = {
      title: 'Consent Title',
      resourceType: 'Questionnaire',
      id: 'consentId',
      status: 'active',
    };
    axiosMock
      .onGet(`/v1/consent/projects/${activeProject.id}/default-form`)
      .reply(200, consent);

    const directive = {
      title: 'Directive',
      resourceType: 'Consent',
      id: 'directiveId',
      status: 'active',
    };
    const responseMock = { items: [directive] };

    axiosMock.onGet(`/v1/consent/directives/me`).reply(200, responseMock);

    const useTestHook = () => {
      const { useShouldRenderConsentScreen } = useConsent();
      return useShouldRenderConsentScreen();
    };

    const { result } = renderHookInContext(useTestHook);

    await waitFor(() => {
      expect(result.current.shouldRenderConsentScreen).toBe(false);
    });
  });

  test('should return true if the user did not accept the existing project consent', async () => {
    const consent = {
      title: 'Consent Title',
      resourceType: 'Questionnaire',
      id: 'consentId',
      status: 'active',
    };
    axiosMock
      .onGet(`/v1/consent/projects/${activeProject.id}/default-form`)
      .reply(200, consent);

    const responseMock = { items: [] };

    axiosMock.onGet(`/v1/consent/directives/me`).reply(200, responseMock);

    const useTestHook = () => {
      const { useShouldRenderConsentScreen } = useConsent();
      return useShouldRenderConsentScreen();
    };

    const { result } = renderHookInContext(useTestHook);

    await waitFor(() => {
      expect(result.current.shouldRenderConsentScreen).toBe(true);
    });
  });

  test('should return true if the user declined the existing project consent', async () => {
    const consent = {
      title: 'Consent Title',
      resourceType: 'Questionnaire',
      id: 'consentId',
      status: 'active',
    };
    axiosMock
      .onGet(`/v1/consent/projects/${activeProject.id}/default-form`)
      .reply(200, consent);

    const directive = {
      title: 'Directive',
      resourceType: 'Consent',
      id: 'directiveId',
      status: 'rejected',
    };
    const responseMock = { items: [directive] };

    axiosMock.onGet(`/v1/consent/directives/me`).reply(200, responseMock);

    const useTestHook = () => {
      const { useShouldRenderConsentScreen } = useConsent();
      return useShouldRenderConsentScreen();
    };

    const { result } = renderHookInContext(useTestHook);

    await waitFor(() => {
      expect(result.current.shouldRenderConsentScreen).toBe(true);
    });
  });
});

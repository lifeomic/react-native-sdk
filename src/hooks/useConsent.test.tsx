import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useConsent } from './useConsent';
import { useHttpClient } from './useHttpClient';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

jest.mock('./useHttpClient', () => ({
  useHttpClient: jest.fn(),
}));

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
  useHttpClientMock.mockReturnValue({ httpClient: axiosInstance });
  axiosMock.reset();
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
    axiosMock.onPatch('/v1/consent/directives/me/directive-id').reply(200, {});

    const useTestHook = () => {
      const { useUpdateProjectConsentDirective } = useConsent();
      return useUpdateProjectConsentDirective();
    };

    const { result } = renderHookInContext(useTestHook);
    await act(async () => {
      await result.current.mutateAsync({
        directiveId: 'directive-id',
        accept: true,
      });
    });

    expect(axiosMock.history.patch[0].url).toBe(
      `/v1/consent/directives/me/directive-id`,
    );
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
      status: 'active',
      response: {
        item: [
          {
            linkId: 'terms',
          },
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
    axiosMock.onPatch('/v1/consent/directives/me/directive-id').reply(200, {});

    const useTestHook = () => {
      const { useUpdateProjectConsentDirective } = useConsent();
      return useUpdateProjectConsentDirective();
    };

    const { result } = renderHookInContext(useTestHook);
    await act(async () => {
      await result.current.mutateAsync({
        directiveId: 'directive-id',
        accept: false,
      });
    });

    expect(axiosMock.history.patch[0].url).toBe(
      `/v1/consent/directives/me/directive-id`,
    );
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
      status: 'rejected',
      response: {
        item: [
          {
            linkId: 'terms',
          },
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
  test('should return false if the user has accepted all assigned any consents', async () => {
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

  test('should return true if the user has a proposed consent', async () => {
    const directive = {
      title: 'Directive',
      resourceType: 'Consent',
      id: 'directiveId',
      status: 'proposed',
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
      expect(result.current.consentDirectives).toEqual([directive]);
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
      expect(result.current.consentDirectives).toEqual([directive]);
    });
  });
});

import React from 'react';
import { createAPIMockingUtility } from '@lifeomic/one-query/test-utils';
import { setupServer } from 'msw/node';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAppsAPIMutation } from './apps-api';
import { AuthAPIEndpoints } from '@lifeomic/react-client';

const server = setupServer();
server.listen({ onUnhandledRequest: 'error' });

const adoptAppsAPIMocking = createAPIMockingUtility<AuthAPIEndpoints>({
  server,
  baseUrl: 'https://apps.us.lifeomic.com',
});

const renderHookInContext = () => {
  return renderHook(() => useAppsAPIMutation('POST /auth/v1/api/signup'), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    ),
  });
};

const api = adoptAppsAPIMocking();

test('makes mutation request', async () => {
  const credentials = {
    userConfirmed: true,
    tokenType: 'Bearer',
    accessToken: 'access-token',
    identityToken: 'identity-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    originalUrl: 'myapp://evc-signup',
  } as const;

  api.mock('POST /auth/v1/api/signup', {
    status: 200,
    data: credentials,
  });

  const { result } = renderHookInContext();
  await act(async () => {
    // Note: Without wrapping this particular waitFor jest will throw an act warning
    await waitFor(() => expect(result.current.isSuccess).toBeDefined());
  });

  let response: any;
  await act(async () => {
    response = await result.current.mutateAsync({
      evc: 'evc-code',
      inviteId: 'invite-id',
      originalUrl: 'myapp://evc-signup',
      clientId: 'client-id',
      email: 'bat.man@thecave.com',
    });
  });

  await waitFor(() => expect(response).toEqual(credentials));
  await waitFor(() => expect(result.current.isSuccess).toBeDefined());
});

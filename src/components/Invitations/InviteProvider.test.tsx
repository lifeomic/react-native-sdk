import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InviteProvider } from './InviteProvider';
import { InviteParams, inviteNotifier } from './InviteNotifier';
import { usePendingInvite } from '../../hooks/usePendingInvite';
import { useAuth } from '../../hooks/useAuth';
import { createRestAPIMock } from '../../test-utils/rest-api-mocking';

const api = createRestAPIMock();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.Mock;

const mutationMock = jest.fn();

const refreshForInviteAccept = jest.fn();
const mockInviteParams: InviteParams = {
  inviteId: 'invite-id',
  evc: 'evc',
};
const mockAuthResult = {
  accessToken: 'access-token',
};

const renderHookInContext = async () => {
  return renderHook(() => usePendingInvite(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <InviteProvider>{children}</InviteProvider>
      </QueryClientProvider>
    ),
  });
};

beforeEach(() => {
  useAuthMock.mockReturnValue({
    authResult: undefined,
    refreshForInviteAccept,
  });
  api.mock(
    'PATCH /v1/invitations/:inviteId',
    mutationMock.mockReturnValue({
      status: 200,
      data: { account: 'invited-account' } as any,
    }),
  );
  inviteNotifier.clearCache();
});

it('without provider, methods fail', async () => {
  const { result } = renderHook(() => usePendingInvite());
  await expect(result.current.clearPendingInvite()).rejects.toBeUndefined();
});

it('listens for invite params and exposes them', async () => {
  const { result } = await renderHookInContext();
  expect(result.current.inviteParams).toEqual({});

  act(() => {
    inviteNotifier.emit('inviteDetected', mockInviteParams);
  });
  expect(result.current.inviteParams).toEqual(mockInviteParams);
});

it('allows for clearing pending invite params', async () => {
  const { result } = await renderHookInContext();
  act(() => {
    inviteNotifier.emit('inviteDetected', mockInviteParams);
  });
  expect(result.current.inviteParams).toEqual(mockInviteParams);
  act(() => {
    result.current.clearPendingInvite();
  });
  expect(result.current.inviteParams).toEqual({});
});

describe('accepting invite', () => {
  it('automatically happens once an inviteId and accessToken are present', async () => {
    const { rerender } = await renderHookInContext();
    await act(async () => {
      inviteNotifier.emit('inviteDetected', mockInviteParams);
      useAuthMock.mockReturnValue({
        authResult: mockAuthResult,
        refreshForInviteAccept,
      });
      await rerender({});
    });
    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { status: 'ACCEPTED' },
        params: { inviteId: mockInviteParams.inviteId },
      }),
    );
    // Confirm account header was not sent.
    expect(
      mutationMock.mock.calls[0][0].headers['LifeOmic-Account'],
    ).toBeUndefined();
  });

  it('refreshes auth token, emits inviteAccepted, then waits for inviteAccountSettled to resets cache and mutation', async () => {
    const acceptListener = jest.fn();
    inviteNotifier.addListener('inviteAccepted', acceptListener);
    const { result, rerender } = await renderHookInContext();
    await act(async () => {
      inviteNotifier.emit('inviteDetected', mockInviteParams);
      useAuthMock.mockReturnValue({
        authResult: mockAuthResult,
        refreshForInviteAccept,
      });
      await rerender({});
    });
    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { status: 'ACCEPTED' },
        params: { inviteId: mockInviteParams.inviteId },
      }),
    );
    // Confirm account header was not sent.
    expect(
      mutationMock.mock.calls[0][0].headers['LifeOmic-Account'],
    ).toBeUndefined();
    expect(result.current.inviteParams).toEqual({});
    expect(refreshForInviteAccept).toHaveBeenCalled();
    expect(acceptListener).toHaveBeenCalled();

    await act(async () => {
      inviteNotifier.emit('inviteAccountSettled');
      await rerender({});
    });

    inviteNotifier.removeListener('inviteAccepted', acceptListener);
  });

  it('catches unknown errors and still clears cache', async () => {
    mutationMock.mockReturnValue({ status: 500, data: {} });
    const { result, rerender } = await renderHookInContext();
    await act(async () => {
      inviteNotifier.emit('inviteDetected', mockInviteParams);
      useAuthMock.mockReturnValue({
        authResult: mockAuthResult,
        refreshForInviteAccept,
      });
      await rerender({});
    });
    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { status: 'ACCEPTED' },
        params: { inviteId: mockInviteParams.inviteId },
      }),
    );
    // Confirm account header was not sent.
    expect(
      mutationMock.mock.calls[0][0].headers['LifeOmic-Account'],
    ).toBeUndefined();
    expect(refreshForInviteAccept).not.toHaveBeenCalled();
    expect(result.current.inviteParams).toEqual({});
  });
});

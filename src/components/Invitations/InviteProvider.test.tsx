import React from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  InviteProvider,
  clearPendingInvite,
  usePendingInvite,
} from './InviteProvider';
import { InviteParams, inviteNotifier } from './InviteNotifier';
import { useAuth } from '../../hooks/useAuth';
import { createRestAPIMock } from '../../test-utils/rest-api-mocking';
import { Text } from 'react-native';

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

const renderUI = (children: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <InviteProvider>{children}</InviteProvider>
    </QueryClientProvider>,
  );

const renderHookInContext = async () => {
  return renderHook(() => usePendingInvite(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <InviteProvider>
          <></>
        </InviteProvider>
        {children}
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
  clearPendingInvite();
  inviteNotifier.clearCache();
});

it('listens for invite params and exposes them', async () => {
  const { result } = await renderHookInContext();
  expect(result.current).toEqual(undefined);

  act(() => {
    inviteNotifier.emit('inviteDetected', mockInviteParams);
  });
  await waitFor(() => {
    expect(result.current).toStrictEqual(mockInviteParams);
  });
});

it('allows for clearing pending invite params', async () => {
  const { result } = await renderHookInContext();
  act(() => {
    inviteNotifier.emit('inviteDetected', mockInviteParams);
  });
  expect(result.current).toEqual(mockInviteParams);
  act(() => {
    clearPendingInvite();
  });
  expect(result.current).toEqual(undefined);
});

it('renders loading indicator while there is a pending invite', async () => {
  inviteNotifier.emit('inviteDetected', mockInviteParams);

  renderUI(<Text>content</Text>);

  screen.getByRole('progressbar');

  await waitFor(() => {
    screen.getByText('content');
  });
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

  it('refreshes auth token', async () => {
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
    expect(result.current).toEqual(undefined);
    expect(refreshForInviteAccept).toHaveBeenCalled();
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
    expect(result.current).toEqual(undefined);
  });
});

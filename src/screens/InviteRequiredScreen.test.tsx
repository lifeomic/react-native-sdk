import React from 'react';
import { render } from '@testing-library/react-native';
import { InviteRequiredScreen } from './InviteRequiredScreen';
import { useActiveAccount, useActiveProject, useConsent } from '../hooks';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('../hooks/useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useConsent', () => ({
  useConsent: jest.fn(),
}));

const useConsentMock = useConsent as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const useActiveAccountMock = useActiveAccount as jest.Mock;

useConsentMock.mockReturnValue({
  useShouldRenderConsentScreen: () => ({
    shouldRenderConsentScreen: false,
    isLoading: false,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockReplace = jest.fn();
const mockNavigation = {
  replace: mockReplace,
};

const inviteRequiredScreen = (
  <QueryClientProvider client={queryClient}>
    <InviteRequiredScreen
      navigation={mockNavigation as any}
      route={jest.fn() as any}
    />
  </QueryClientProvider>
);

test('renders loading indicator while either query is loading', async () => {
  useActiveProjectMock.mockReturnValue({
    isLoading: true,
    activeProject: undefined,
    isFetched: false,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: true,
    account: undefined,
    isFetched: false,
  });

  const { getByTestId, rerender } = render(inviteRequiredScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();

  useActiveProjectMock.mockReturnValue({
    isLoading: false,
    activeProject: undefined,
    isFetched: true,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: true,
    account: undefined,
    isFetched: false,
  });

  rerender(inviteRequiredScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

it('renders invite required text and logout button', () => {
  useActiveProjectMock.mockReturnValue({
    isLoading: false,
    activeProject: undefined,
    isFetched: true,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: false,
    account: undefined,
    isFetched: true,
  });
  const { getByTestId } = render(inviteRequiredScreen);
  expect(getByTestId('invite-only-text')).toBeDefined();
});

it('renders loading indicator if pending consent query', () => {
  useActiveProjectMock.mockReturnValue({
    isLoading: false,
    activeProject: { id: 'someProjectId' },
    isFetched: true,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: false,
    account: { id: 'someAccountId' },
    isFetched: true,
  });
  useConsentMock.mockReturnValue({
    useShouldRenderConsentScreen: () => ({
      shouldRenderConsentScreen: false,
      isLoading: true,
    }),
  });

  const { getByTestId } = render(inviteRequiredScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

it('replaces current route with consent screen if consent is required', () => {
  useActiveProjectMock.mockReturnValue({
    isLoading: false,
    activeProject: { id: 'someProjectId' },
    isFetched: true,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: false,
    account: { id: 'someAccountId' },
    isFetched: true,
  });
  useConsentMock.mockReturnValue({
    useShouldRenderConsentScreen: () => ({
      shouldRenderConsentScreen: true,
      isLoading: false,
    }),
  });

  render(inviteRequiredScreen);
  expect(mockReplace).toBeCalledWith('screens/ConsentScreen');
});

it('replaces current route with app if consent is not required', () => {
  useActiveProjectMock.mockReturnValue({
    isLoading: false,
    activeProject: { id: 'someProjectId' },
    isFetched: true,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: false,
    account: { id: 'someAccountId' },
    isFetched: true,
  });
  useConsentMock.mockReturnValue({
    useShouldRenderConsentScreen: () => ({
      shouldRenderConsentScreen: false,
      isLoading: false,
    }),
  });

  render(inviteRequiredScreen);
  expect(mockReplace).toBeCalledWith('app');
});

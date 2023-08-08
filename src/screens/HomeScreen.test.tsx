import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppConfig, useActiveAccount, useAppConfig } from '../hooks';
import { HomeScreen } from './HomeScreen';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GraphQLClientContextProvider } from '../hooks/useGraphQLClient';

jest.unmock('i18next');
jest.unmock('@react-navigation/native');
jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;
const navigateMock = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

const exampleAppConfig: AppConfig = {
  homeTab: {
    appTiles: [
      {
        id: 'id1',
        title: 'App Tile Title',
        source: {
          url: 'http://unit-test/app-tile',
        },
      },
      {
        id: 'id2',
        title: 'App Tile Title',
        source: {
          url: 'http://unit-test/app-tile',
        },
      },
    ],
    screenHeader: {
      title: 'Custom Screen Title',
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const baseURL = 'https://some-domain/unit-test';
const homeScreen = (
  <QueryClientProvider client={queryClient}>
    <GraphQLClientContextProvider baseURL={baseURL}>
      <HomeScreen navigation={navigateMock as any} route={{} as any} />
    </GraphQLClientContextProvider>
  </QueryClientProvider>
);

beforeEach(() => {
  useActiveAccountMock.mockReturnValue({
    isLoading: false,
  });
  useAppConfigMock.mockReturnValue({
    isLoading: false,
    data: exampleAppConfig,
  });
});

test('renders loading indicator while account fetching', async () => {
  useActiveAccountMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(homeScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders loading indicator while app config fetching', async () => {
  useAppConfigMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(homeScreen);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('sets the custom header title', async () => {
  render(homeScreen);
  await waitFor(() => {
    expect(navigateMock.setOptions).toHaveBeenCalledWith({
      title: 'Custom Screen Title',
    });
  });
});

test('renders app tiles', async () => {
  const { getByTestId } = render(homeScreen);
  expect(
    getByTestId(`tile-button-${exampleAppConfig.homeTab?.appTiles?.[0].id}`),
  ).toBeDefined();
});

test('handles app tile taps via navigation', async () => {
  const { getByTestId } = render(homeScreen);
  const firstTile = exampleAppConfig.homeTab?.appTiles?.[0];
  fireEvent.press(getByTestId(`tile-button-${firstTile?.id}`));
  expect(navigateMock.navigate).toHaveBeenCalledWith('Home/AppTile', {
    appTile: firstTile,
  });
});

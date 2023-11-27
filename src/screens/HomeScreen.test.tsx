import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppConfig, useActiveAccount, useAppConfig } from '../hooks';
import { HomeScreen } from './HomeScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
      enableRefresh: true,
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
  useActiveAccountMock.mockReturnValue({});
  useAppConfigMock.mockReturnValue({
    isLoading: false,
    data: exampleAppConfig,
  });
});

test('sets the custom header title', async () => {
  render(homeScreen);
  await waitFor(() => {
    expect(navigateMock.setOptions).toHaveBeenCalledWith({
      title: 'Custom Screen Title',
    });
  });
});

test('sets headerLeft when enableRefresh is true', async () => {
  render(homeScreen);
  await waitFor(() => {
    expect(navigateMock.setOptions).toHaveBeenCalledWith({
      headerLeft: expect.anything(),
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

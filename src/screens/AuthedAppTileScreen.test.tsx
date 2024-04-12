import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AuthedAppTileScreen } from './AuthedAppTileScreen';
import { useActiveProject } from '../hooks/useActiveProject';
import { ActiveAccountProvider } from '../hooks/useActiveAccount';
import { useHandleAppTileEvents } from '../hooks/useHandleAppTileEvents';
import { useAppConfig } from '../hooks/useAppConfig';
import { createRestAPIMock } from '../test-utils/rest-api-mocking';
import { HttpClientContextProvider } from '../hooks/useHttpClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const api = createRestAPIMock();

jest.mock('../hooks/useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('../hooks/useHandleAppTileEvents', () => ({
  useHandleAppTileEvents: jest.fn(),
}));
jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

const useActiveProjectMock = useActiveProject as jest.Mock;
const useHandleAppTileEventsMock = useHandleAppTileEvents as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;

const handleAppTileMessageMock = jest.fn();
const handleAppTileNavigationStateChangeMock = jest.fn();

const navigation = {
  setOptions: jest.fn(),
} as any;
const route = { params: {} } as any;

const appTile = {
  id: 'appTileId',
  title: 'app tile title',
  source: {
    url: 'http://unit-test/app-tile',
  },
  clientId: 'someClientId',
  callbackUrls: ['http://unit-test/app-tile/callback'],
  scope: 'PUBLIC',
};

const renderScreen = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ActiveAccountProvider account="acct1">
        <HttpClientContextProvider>
          <AuthedAppTileScreen navigation={navigation} route={route} />
        </HttpClientContextProvider>
      </ActiveAccountProvider>
    </QueryClientProvider>,
  );

beforeEach(() => {
  api.mock('POST /v1/client-tokens', {
    status: 200,
    data: { code: 'someCode' },
  });
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
    activeSubjectId: 'subjectId',
    isFetched: true,
    isLoading: false,
  });
  useHandleAppTileEventsMock.mockReturnValue({
    handleAppTileMessage: handleAppTileMessageMock,
    handleAppTileNavigationStateChange: handleAppTileNavigationStateChangeMock,
  });
  useAppConfigMock.mockReturnValue({ data: {} });
});

test('builds uri with code, projectId, patientId, and accountId', async () => {
  route.params.appTile = appTile;
  const { getByTestId } = renderScreen();
  await waitFor(() => {
    const AppTileWebView = getByTestId('app-tile-webview');
    expect(AppTileWebView.props.source).toMatchObject({
      uri: 'http://unit-test/app-tile/callback?accountId=acct1&code=someCode&patientId=subjectId&projectId=projectId',
    });
  });
});

test('calls handleAppTileMessage', async () => {
  route.params.appTile = appTile;
  const { findByTestId } = renderScreen();
  const AppTileWebView = await findByTestId('app-tile-webview');
  const event = {
    nativeEvent: {
      data: JSON.stringify({}),
    },
  };
  AppTileWebView.props.onMessage(event);
  await waitFor(() => expect(handleAppTileMessageMock).toBeCalledWith(event));
});

test('sets the appTitle title as the screen title', async () => {
  route.params.appTile = appTile;
  const { findByTestId } = renderScreen();
  await findByTestId('app-tile-webview');
  expect(navigation.setOptions).toBeCalledWith({
    title: appTile.title,
  });
});

test('sets the titleOverride as the screen title', async () => {
  route.params.appTile = appTile;
  const TITLE_OVERRIDE = 'My title override';
  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        appTileSettings: {
          appTiles: {
            [appTile.id]: {
              title: TITLE_OVERRIDE,
            },
          },
        },
      },
    },
  });
  const { findByTestId } = renderScreen();
  await findByTestId('app-tile-webview');
  expect(navigation.setOptions).toBeCalledWith({
    title: TITLE_OVERRIDE,
  });
});

test('handles existing appTileSettings with no appTile override title', async () => {
  route.params.appTile = appTile;
  useAppConfigMock.mockReturnValue({
    data: {
      homeTab: {
        appTileSettings: {
          appTiles: {},
        },
      },
    },
  });
  const { findByTestId } = renderScreen();
  await findByTestId('app-tile-webview');
  expect(navigation.setOptions).toBeCalledWith({
    title: appTile.title,
  });
});

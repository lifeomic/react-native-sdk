import React from 'react';
import { render } from '@testing-library/react-native';
import { WebView } from 'react-native-webview';
import { AuthedAppTileScreen } from './AuthedAppTileScreen';
import { useExchangeToken } from '../hooks/useExchangeToken';
import { useActiveProject } from '../hooks/useActiveProject';
import { useActiveAccount } from '../hooks/useActiveAccount';

jest.mock('react-native-webview', () => ({
  WebView: jest.fn().mockReturnValue(<></>),
}));
jest.mock('../hooks/useExchangeToken', () => ({
  useExchangeToken: jest.fn(),
}));
jest.mock('../hooks/useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));

const webviewMock = WebView as jest.Mock;
const useExchangeTokenMock = useExchangeToken as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const useActiveAccountMock = useActiveAccount as jest.Mock;

const navigation = {
  setOptions: jest.fn(),
} as any;
const route = { params: {} } as any;

beforeEach(() => {
  useExchangeTokenMock.mockReturnValue({
    data: {
      code: 'someCode',
    },
    isFetched: true,
    isLoading: false,
  });
  useActiveAccountMock.mockReturnValue({
    account: {
      id: 'acct1',
    },
    isFetched: true,
    isLoading: false,
  });
  useActiveProjectMock.mockReturnValue({
    activeProject: { id: 'projectId' },
    isFetched: true,
    isLoading: false,
  });
});

test('builds uri with code only when appTile is not "LifeOmic" hosted', () => {
  const appTile = {
    id: 'appTileId',
    title: 'app tile title',
    source: {
      url: 'http://unit-test/app-tile',
    },
    clientId: 'someClientId',
    callbackUrls: ['http://unit-test/app-tile/callback'],
  };
  route.params.appTile = appTile;
  render(<AuthedAppTileScreen navigation={navigation} route={route} />);
  expect(useExchangeTokenMock).toHaveBeenCalledTimes(1);
  expect(webviewMock.mock.calls[0][0]).toMatchObject({
    source: {
      uri: 'http://unit-test/app-tile/callback?code=someCode',
    },
  });
});

test('builds uri with code, projectId, and accountId for "LifeOmic" hosted tiles', () => {
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
  route.params.appTile = appTile;
  render(<AuthedAppTileScreen navigation={navigation} route={route} />);
  expect(useExchangeTokenMock).toHaveBeenCalledTimes(1);
  expect(webviewMock.mock.calls[0][0]).toMatchObject({
    source: {
      uri: 'http://unit-test/app-tile/callback?accountId=acct1&code=someCode&projectId=projectId',
    },
  });
});

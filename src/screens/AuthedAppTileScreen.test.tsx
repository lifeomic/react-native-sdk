import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthedAppTileScreen } from './AuthedAppTileScreen';
import { useExchangeToken } from '../hooks/useExchangeToken';
import { useActiveProject } from '../hooks/useActiveProject';
import { useActiveAccount } from '../hooks/useActiveAccount';
import { useHandleAppTileEvents } from '../hooks/useHandleAppTileEvents';

jest.mock('../hooks/useExchangeToken', () => ({
  useExchangeToken: jest.fn(),
}));
jest.mock('../hooks/useActiveProject', () => ({
  useActiveProject: jest.fn(),
}));
jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useHandleAppTileEvents', () => ({
  useHandleAppTileEvents: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

const useExchangeTokenMock = useExchangeToken as jest.Mock;
const useActiveProjectMock = useActiveProject as jest.Mock;
const useActiveAccountMock = useActiveAccount as jest.Mock;
const useHandleAppTileEventsMock = useHandleAppTileEvents as jest.Mock;

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
    activeSubjectId: 'subjectId',
    isFetched: true,
    isLoading: false,
  });
  useHandleAppTileEventsMock.mockReturnValue({
    handleAppTileMessage: handleAppTileMessageMock,
    handleAppTileNavigationStateChange: handleAppTileNavigationStateChangeMock,
  });
});

test('builds uri with code, projectId, patientId, and accountId', () => {
  route.params.appTile = appTile;
  const { getByTestId } = render(
    <AuthedAppTileScreen navigation={navigation} route={route} />,
  );
  const AppTileWebView = getByTestId('app-tile-webview');
  expect(useExchangeTokenMock).toHaveBeenCalledTimes(1);
  expect(AppTileWebView.props.source).toMatchObject({
    uri: 'http://unit-test/app-tile/callback?accountId=acct1&code=someCode&patientId=subjectId&projectId=projectId',
  });
});

test('calls handleAppTileMessage', () => {
  route.params.appTile = appTile;
  const { getByTestId } = render(
    <AuthedAppTileScreen navigation={navigation} route={route} />,
  );
  const AppTileWebView = getByTestId('app-tile-webview');
  const event = {
    nativeEvent: {
      data: JSON.stringify({}),
    },
  };
  AppTileWebView.props.onMessage(event);
  expect(handleAppTileMessageMock).toBeCalledWith(event);
});
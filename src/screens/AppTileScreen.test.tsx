import React from 'react';
import { render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { AppTileScreen } from './AppTileScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as UseHandleAppTileEvents from '../hooks/useHandleAppTileEvents';
import { ActiveAccountProvider } from '../hooks';

jest.mock('react-native-webview', () => ({
  WebView: jest.fn().mockReturnValue(<></>),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));
jest.mock('../components/TrackTile/hooks/useTrackers', () => ({
  useTrackers: jest.fn(() => ({})),
}));

const webviewMock = WebView as jest.Mock;
const navigation = {
  setOptions: jest.fn(),
  addListener: jest.fn(),
} as any;
const route = { params: {} } as any;
const exampleAppTile = {
  id: 'appTileId',
  title: 'app tile title',
  source: {
    url: 'http://unit-test/app-tile',
  },
};
const useNavigationMock = useNavigation as any as jest.Mock;

beforeEach(() => {
  route.params.appTile = exampleAppTile;
  useNavigationMock.mockReturnValue(navigation);

  jest.spyOn(UseHandleAppTileEvents, 'useHandleAppTileEvents').mockReturnValue({
    handleAppTileMessage: jest.fn(),
    handleAppTileNavigationStateChange: jest.fn(),
  });
});

test('renders webview with source prop', () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ActiveAccountProvider account="mockaccount">
        <AppTileScreen navigation={navigation} route={route} />
      </ActiveAccountProvider>
    </QueryClientProvider>,
  );
  expect(webviewMock.mock.calls[0][0]).toMatchObject({
    source: { uri: exampleAppTile.source.url },
  });
});

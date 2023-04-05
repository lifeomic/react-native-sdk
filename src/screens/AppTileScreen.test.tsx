import React from 'react';
import { render } from '@testing-library/react-native';
import { WebView } from 'react-native-webview';
import { AppTileScreen } from './AppTileScreen';

jest.mock('react-native-webview', () => ({
  WebView: jest.fn().mockReturnValue(<></>),
}));

const webviewMock = WebView as jest.Mock;
const navigation = {
  setOptions: jest.fn(),
} as any;
const route = { params: {} } as any;
const exampleAppTile = {
  id: 'appTileId',
  title: 'app tile title',
  source: {
    url: 'http://unit-test/app-tile',
  },
};

beforeEach(() => {
  route.params.appTile = exampleAppTile;
});

test('renders webview with source prop', () => {
  render(<AppTileScreen navigation={navigation} route={route} />);
  expect(webviewMock.mock.calls[0][0]).toMatchObject({
    source: { uri: exampleAppTile.source.url },
  });
});

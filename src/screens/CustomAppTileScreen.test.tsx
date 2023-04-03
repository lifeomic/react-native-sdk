import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { CustomAppTileScreen } from './CustomAppTileScreen';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';

jest.mock('../hooks/useDeveloperConfig', () => ({
  useDeveloperConfig: jest.fn(),
}));

const useDeveloperConfigMock = useDeveloperConfig as jest.Mock;

const navigation = {
  setOptions: jest.fn(),
} as any;
const route = { params: {} } as any;
const exampleAppTile = {
  id: 'appTileId',
  title: 'app tile title',
  source: {
    url: 'http://unit-test/custom-app-tiles/foo',
  },
};

beforeEach(() => {
  route.params.appTile = exampleAppTile;
  useDeveloperConfigMock.mockReturnValue({});
});

test('renders custom screen component', () => {
  function MyComponent() {
    return <Text>Hi</Text>;
  }
  useDeveloperConfigMock.mockReturnValue({
    appTileScreens: {
      'http://unit-test/custom-app-tiles/foo': MyComponent,
    },
  });
  const { getByText } = render(
    <CustomAppTileScreen navigation={navigation} route={route} />,
  );
  expect(getByText('Hi')).toBeDefined();
});

test('renders simple error message in edge case screen misconfig', () => {
  useDeveloperConfigMock.mockReturnValue({
    appTileScreens: {},
  });
  const { getByTestId } = render(
    <CustomAppTileScreen navigation={navigation} route={route} />,
  );
  expect(getByTestId('custom-app-tile-error')).toBeDefined();
});

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { useNavigation } from '@react-navigation/native';
import { AppConfig, useActiveAccount, useAppConfig } from '../hooks';
import { HomeScreen } from './HomeScreen';

jest.mock('../hooks/useActiveAccount', () => ({
  useActiveAccount: jest.fn(),
}));
jest.mock('../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

const useActiveAccountMock = useActiveAccount as jest.Mock;
const useAppConfigMock = useAppConfig as jest.Mock;
const useNavigationMock = useNavigation as jest.Mock;
const navigateMock = jest.fn();

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
  },
};

beforeEach(() => {
  useNavigationMock.mockReturnValue({
    navigate: navigateMock,
  });
  useActiveAccountMock.mockReturnValue({
    isLoading: false,
  });
  useAppConfigMock.mockReturnValue({
    isLoading: false,
    data: exampleAppConfig,
  });
});

test('renders loading indicator initially', async () => {
  useActiveAccountMock.mockReturnValue({
    isLoading: true,
  });
  const { getByTestId } = render(<HomeScreen />);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders app tiles', async () => {
  const { getByTestId } = render(<HomeScreen />);
  expect(
    getByTestId(`tile-button-${exampleAppConfig.homeTab?.appTiles?.[0].id}`),
  ).toBeDefined();
});

test('handles app tile taps via navigation', async () => {
  const { getByTestId } = render(<HomeScreen />);
  const firstTile = exampleAppConfig.homeTab?.appTiles?.[0];
  fireEvent.press(getByTestId(`tile-button-${firstTile?.id}`));
  expect(navigateMock).toHaveBeenCalledWith('tiles/AppTile', {
    appTile: firstTile,
  });
});

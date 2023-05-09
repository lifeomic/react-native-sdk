import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { TilesList } from './TilesList';
import { useNavigation } from '@react-navigation/native';
import { useAppConfig } from '../../hooks/useAppConfig';

jest.unmock('i18next');

jest.mock('../TrackTile', () => ({
  TrackTile: ({ title }: { title: string }) => <Text>{title}</Text>,
}));

jest.mock('../../hooks/useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));

beforeEach(() => {
  (useAppConfig as jest.Mock).mockReturnValue({
    data: {
      homeTab: {
        tiles: ['trackTile', 'todayTile'],
        trackTileSettings: {
          title: 'TrackTile Title',
        },
        appTiles: [
          {
            id: 'tile-id-1',
            title: 'My First Tile',
            source: { url: 'https://tile.com' },
          },
          {
            id: 'tile-id-2',
            title: 'My Second Tile',
            source: { url: 'https://tile.com' },
          },
        ],
        todayTile: {
          id: 'today-tile',
          title: 'Today',
          source: { url: 'https://today-tile.com' },
        },
      },
    },
  });
});

test('renders multiple tiles', () => {
  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.getByText('TrackTile Title')).toBeDefined();

  expect(tileList.getByText('My First Tile')).toBeDefined();
  expect(tileList.getByTestId('tile-button-tile-id-1')).toBeDefined();

  expect(tileList.getByText('My Second Tile')).toBeDefined();
  expect(tileList.getByTestId('tile-button-tile-id-2')).toBeDefined();

  expect(tileList.getByText('Today')).toBeDefined();
  expect(tileList.getByTestId('tile-button-today-tile')).toBeDefined();
});

test('does not render the today tile if not enabled', () => {
  (useAppConfig as jest.Mock).mockReturnValue({
    data: {
      homeTab: {
        tiles: ['trackTile'],
        trackTileSettings: {
          title: 'TrackTile Title',
        },
        appTiles: [
          {
            id: 'tile-id-1',
            title: 'My First Tile',
            source: { url: 'https://tile.com' },
          },
          {
            id: 'tile-id-2',
            title: 'My Second Tile',
            source: { url: 'https://tile.com' },
          },
        ],
      },
    },
  });

  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.queryByText('Today')).toBe(null);
  expect(tileList.queryByTestId('tile-button-today-tile')).toBe(null);
});

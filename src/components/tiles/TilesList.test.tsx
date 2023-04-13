import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { TilesList } from './TilesList';

jest.unmock('i18next');

jest.mock('../TrackTile', () => ({
  TrackTile: ({ title }: { title: string }) => <Text>{title}</Text>,
}));

jest.mock('../../hooks/useAppConfig', () => ({
  useAppConfig: () => ({
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
  }),
}));

test('renders multiple tiles', () => {
  const tileList = render(<TilesList />);

  expect(tileList.getByText('TrackTile Title')).toBeDefined();

  expect(tileList.getByText('My First Tile')).toBeDefined();
  expect(tileList.getByTestId('tile-button-tile-id-1')).toBeDefined();

  expect(tileList.getByText('My Second Tile')).toBeDefined();
  expect(tileList.getByTestId('tile-button-tile-id-2')).toBeDefined();
});

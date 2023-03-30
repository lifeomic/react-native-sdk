import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { TileList } from './TilesList';

jest.unmock('i18next');

const tiles = [
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
];

test('renders multiple tiles', () => {
  const onPress = jest.fn();
  const tile = render(<TileList tiles={tiles} onAppTilePress={onPress} />);

  expect(tile.getByText('My First Tile')).toBeDefined();
  expect(tile.getByTestId('tile-button-tile-id-1')).toBeDefined();

  expect(tile.getByText('My Second Tile')).toBeDefined();
  expect(tile.getByTestId('tile-button-tile-id-2')).toBeDefined();

  fireEvent.press(tile.getByTestId('tile-button-tile-id-1'));
  expect(onPress).toHaveBeenCalled();
});

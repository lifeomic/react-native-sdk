import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Tile } from './Tile';

const exampleTileConfig = {
  id: 'tile-id',
  title: 'My Tile',
};

test('can render tile with onPress', () => {
  const onPress = jest.fn();
  const tile = render(<Tile {...exampleTileConfig} onPress={onPress} />);

  expect(tile.getByText('My Tile')).toBeDefined();
  expect(tile.getByTestId('tile-button-tile-id')).toBeDefined();

  fireEvent.press(tile.getByTestId('tile-button-tile-id'));
  expect(onPress).toHaveBeenCalled();
});

test('can render tile without onPress', () => {
  const tile = render(<Tile {...exampleTileConfig} />);

  expect(tile.getByTestId('tile-view-tile-id')).toBeDefined();
  expect(tile.getByText('My Tile')).toBeDefined();
});

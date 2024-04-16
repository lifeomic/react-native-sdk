import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Tile } from './Tile';

const exampleTileConfig = {
  id: 'tile-id',
  title: 'My Tile',
};

test('can render tile with onPress in list mode', () => {
  const onPress = jest.fn();
  const tile = render(
    <Tile tileListMode="list" {...exampleTileConfig} onPress={onPress} />,
  );

  expect(tile.getByText('My Tile')).toBeDefined();
  expect(tile.getByTestId('tile-button-tile-id')).toBeDefined();
  expect(tile.queryAllByTestId('tile-chevron-icon-container').length).toBe(1);

  fireEvent.press(tile.getByTestId('tile-button-tile-id'));
  expect(onPress).toHaveBeenCalled();
});

test('can render tile without onPress in list mode', () => {
  const tile = render(<Tile tileListMode="list" {...exampleTileConfig} />);

  expect(tile.getByTestId('tile-button-tile-id')).toBeDefined();
  expect(tile.getByText('My Tile')).toBeDefined();
  expect(tile.queryAllByTestId('tile-chevron-icon-container').length).toBe(0);
});

test('can render tile in column mode', () => {
  const onPress = jest.fn();
  const tile = render(
    <Tile tileListMode="column" {...exampleTileConfig} onPress={onPress} />,
  );

  expect(tile.getByText('My Tile')).toBeDefined();
  expect(tile.getByTestId('tile-button-tile-id')).toBeDefined();

  fireEvent.press(tile.getByTestId('tile-button-tile-id'));
  expect(onPress).toHaveBeenCalled();
});

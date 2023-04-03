import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { AppTile, Tile } from '../../../src';
import { TilesList } from 'src/components/tiles/TilesList';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import { select } from '@storybook/addon-knobs';

storiesOf('TilesList', module).add('demo', () => {
  const appTiles: AppTile[] = [
    {
      id: 'tile1',
      title: 'App Tile 1',
      source: { url: 'https://lifeomic.com/apps/tile1' },
    },
    {
      id: 'tile2',
      title: 'App Tile 2',
      source: { url: 'https://lifeomic.com/apps/tile2' },
    },
    {
      id: 'tile3',
      title: 'App Tile 3',
      source: { url: 'https://lifeomic.com/apps/tile3' },
    },
    {
      id: 'tile4',
      title: 'App Tile 4',
      source: { url: 'https://lifeomic.com/apps/tile4' },
    },
  ];

  const tile1Length = select(
    'Tile #1 mode',
    {
      halfLength: 'halfLength',
      fullLength: 'fullLength',
    },
    'halfLength',
  );

  const tile2Length = select(
    'Tile #2 mode',
    {
      halfLength: 'halfLength',
      fullLength: 'fullLength',
    },
    'halfLength',
  );

  const tile3Length = select(
    'Tile #3 mode',
    {
      halfLength: 'halfLength',
      fullLength: 'fullLength',
    },
    'fullLength',
  );

  const tile4Length = select(
    'Tile #4 mode',
    {
      halfLength: 'halfLength',
      fullLength: 'fullLength',
    },
    'fullLength',
  );

  const onTilePress = () => Alert.alert('Clicked app tile');

  return (
    <NavigationContainer>
      <TilesList>
        <Tile
          id={appTiles[0].id}
          title={appTiles[0].title}
          mode={tile1Length}
          onPress={onTilePress}
        />
        <Tile
          id={appTiles[1].id}
          title={appTiles[1].title}
          mode={tile2Length}
          onPress={onTilePress}
        />
        <Tile
          id={appTiles[2].id}
          title={appTiles[2].title}
          mode={tile3Length}
          onPress={onTilePress}
        />
        <Tile
          id={appTiles[3].id}
          title={appTiles[3].title}
          mode={tile4Length}
          onPress={onTilePress}
        />
      </TilesList>
    </NavigationContainer>
  );
});

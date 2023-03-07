import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { AppTile, spaceBetweenTiles, Tile, tileWidth } from '../../../src';
import { TileList } from 'src/components/tiles/TilesList';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';

storiesOf('TilesList', module).add('demo', () => {
  // TODO: once we have styles/theming/branding: add knobs for styling.
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

  const singleWideTiles = appTiles.splice(0, 2);
  const onTilePress = () => Alert.alert('Clicked app tile');

  return (
    <NavigationContainer>
      <TileList tiles={singleWideTiles} onAppTilePress={onTilePress}>
        {appTiles.map((tile) => (
          <Tile
            id={tile.id}
            title={tile.title}
            styles={{
              tileSize: { width: tileWidth * 2 + spaceBetweenTiles },
            }}
            onPress={onTilePress}
          />
        ))}
      </TileList>
    </NavigationContainer>
  );
});

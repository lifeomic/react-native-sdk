import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { AppTile, Tile } from '../../../src';
import { TilesList } from 'src/components/tiles/TilesList';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, Linking } from 'react-native';

import LearnIcon from '../../../src/components/tiles/icons/MortarBoard.svg';

storiesOf('TilesList', module).add('demo', () => {
  const appTiles: AppTile[] = [
    {
      id: 'tile1',
      title: 'Resources',
      source: { url: 'https://lifeomic.com/resource-library/' },
      icon: 'https://lifeomic.apps.us.lifeomic.com/static/phc/2023-04-05--10-50--18751e5aeba/TodayIcon.766fcbf07db01fb3608ecc1eed3ca265.svg',
    },
  ];

  const onTilePress = (tile: AppTile) => {
    Linking.openURL(tile.source.url);
    return;
  };

  return (
    <NavigationContainer>
      <TilesList
        tiles={appTiles}
        onAppTilePress={(tile: AppTile) => () => onTilePress(tile)}
      >
        <Tile title={'Learn'} Icon={LearnIcon} />
        <Tile title={'No Icon'} />
        <Tile
          title={'No Icon Press'}
          onPress={() => Alert.alert('Clicked app tile')}
        />
      </TilesList>
    </NavigationContainer>
  );
});

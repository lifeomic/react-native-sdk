import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { AppTile, Tile } from '../../../src';
import { TilesList } from 'src/components/tiles/TilesList';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import CircleIcon from '../../../src/components/tiles/icons/heart-circle.svg';
import LearnIcon from '../../../src/components/tiles/icons/MortarBoard.svg';

storiesOf('TilesList', module).add('demo', () => {
  const appTiles: AppTile[] = [
    {
      id: 'tile1',
      title: 'Today',
      source: { url: 'https://lifeomic.com/apps/tile1' },
      icon: 'https://lifeomic.apps.us.lifeomic.com/static/phc/2023-04-05--10-50--18751e5aeba/TodayIcon.766fcbf07db01fb3608ecc1eed3ca265.svg',
    },
  ];

  const onTilePress = () => Alert.alert('Clicked app tile');

  return (
    <NavigationContainer>
      <TilesList tiles={appTiles} onAppTilePress={onTilePress}>
        <Tile title={'Circles'} Icon={CircleIcon} />
        <Tile title={'Learn'} Icon={LearnIcon} />
      </TilesList>
    </NavigationContainer>
  );
});

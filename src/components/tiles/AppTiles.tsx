import React from 'react';
import { View } from 'react-native';
import { AppTile } from '../../hooks/useAppConfig';
import { Tile } from './Tile';

export interface TileProps {
  onPress?: (appTile: AppTile) => void;
  appTiles: AppTile[];
}

export function AppTiles({ onPress, appTiles }: TileProps) {
  return (
    <>
      {appTiles?.map((appTile) => (
        <View key={appTile.id}>
          <Tile title={appTile.title} onPress={() => onPress?.(appTile)} />
        </View>
      ))}
    </>
  );
}

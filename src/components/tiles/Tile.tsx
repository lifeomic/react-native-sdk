import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { tID } from '../../common/testID';

export interface TileProps {
  onPress?: () => void;
  id: string;
  title: string;
  children?: React.ReactNode;
}

export const Tile = ({ onPress, id, title, children }: TileProps) => {
  return (
    <TouchableOpacity testID={tID(`tile-button-${id}`)} onPress={onPress} disabled={!onPress}>
      <View testID={tID(`tile-view-${id}`)}>
        <Text numberOfLines={2}>{title}</Text>
      </View>
      {children}
    </TouchableOpacity>
  );
};

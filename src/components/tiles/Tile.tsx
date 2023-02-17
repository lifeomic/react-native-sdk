import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface TileProps {
  onPress?: () => void;
  title: string;
  children?: React.ReactNode;
}
type ViewTileProps = Pick<TileProps, 'title'>;

const ViewTile = ({ title }: ViewTileProps) => {
  return (
    <View>
      <Text numberOfLines={2}>{title}</Text>
    </View>
  );
};

export const Tile = ({ onPress, title, children }: TileProps) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <ViewTile title={title} />
        {children}
      </TouchableOpacity>
    );
  }

  return <ViewTile title={title} />;
};

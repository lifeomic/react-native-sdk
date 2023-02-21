import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { tID } from '../../common/testID';

export interface TileProps {
  onPress?: () => void;
  id: string;
  title: string;
  children?: React.ReactNode;
}
type ViewTileProps = Pick<TileProps, 'title' | 'id'>;

const ViewTile = ({ title, id }: ViewTileProps) => {
  return (
    <View testID={tID(`tile-view-${id}`)}>
      <Text numberOfLines={2}>{title}</Text>
    </View>
  );
};

export const Tile = ({ onPress, id, title, children }: TileProps) => {
  if (onPress) {
    return (
      <TouchableOpacity testID={tID(`tile-button-${id}`)} onPress={onPress}>
        <ViewTile id={id} title={title} />
        {children}
      </TouchableOpacity>
    );
  }

  return <ViewTile id={id} title={title} />;
};

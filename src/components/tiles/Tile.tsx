import { SvgProps } from 'react-native-svg';
import { BoxTile, BoxTileStyles } from './BoxTile';
import { ListTile, ListTileStyles } from './ListTile';
import React from 'react';

export interface TileProps {
  title: string;
  Icon?: React.FC<SvgProps>;
  id?: string;
  onPress?: () => void;
  testID?: string;
  showBadge?: boolean;
  badge?: () => React.JSX.Element | null;
  children?: React.ReactNode;
  tileListMode: 'list' | 'column';
}

export interface BoxTileProps extends TileProps {
  tileListMode: 'column';
  tileMode?: 'fullLength' | 'halfLength';
  style?: BoxTileStyles;
}

export interface ListTileProps extends TileProps {
  tileListMode: 'list';
  style?: ListTileStyles;
}

export const Tile = (props: ListTileProps | BoxTileProps) => {
  if (props.tileListMode === 'list') {
    return <ListTile {...props} />;
  } else if (props.tileListMode === 'column') {
    return <BoxTile {...props} />;
  }

  return null;
};

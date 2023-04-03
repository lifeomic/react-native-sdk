import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { createStyles, Theme } from '../BrandConfigProvider';
import { tID } from '../../common/testID';

export interface TileProps {
  onPress?: () => void;
  id: string;
  title: string;
  mode?: 'halfLength' | 'fullLength';
  children?: React.ReactNode;
  styles?: TileStyles;
}

export function Tile({
  onPress,
  id,
  title,
  mode = 'fullLength',
  children,
  styles: instanceStyles,
}: TileProps) {
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <TouchableOpacity
      testID={tID(`tile-button-${id}`)}
      onPress={onPress}
      disabled={!onPress}
      style={[
        mode === 'fullLength'
          ? { width: tileWidth * 2 + spaceBetweenTiles }
          : { width: tileWidth },
        styles.tileColor,
        styles.tileSize,
        styles.tileSpacing,
      ]}
    >
      <View testID={tID(`tile-view-${id}`)}>
        <Text numberOfLines={2} style={styles.label}>
          {title}
        </Text>
      </View>
      {children}
    </TouchableOpacity>
  );
}

export const spaceBetweenTiles = 16;
export const tileWidth =
  Math.floor(Dimensions.get('window').width - spaceBetweenTiles * 3) / 2;

const defaultStyles = createStyles('Tile', (theme: Theme) => ({
  tileColor: {
    shadowColor: theme.colors.outline,
    shadowRadius: 3,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 1 },
    backgroundColor: theme.colors.surface,
  },
  tileSpacing: {
    margin: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileSize: {
    height: 130,
  },
  label: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TileStyles = NamedStylesProp<typeof defaultStyles>;

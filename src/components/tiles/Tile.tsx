import React from 'react';
import {
  Dimensions,
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useStyles } from 'src/hooks/useStyles';
import { Theme } from '..';
import { tID } from '../../common/testID';

export interface TileProps {
  onPress?: () => void;
  id: string;
  title: string;
  children?: React.ReactNode;
  styles?: TileStyles;
}

export const Tile = ({
  onPress,
  id,
  title,
  children,
  styles: instanceStyles,
}: TileProps) => {
  const { styles } = useStyles('Tile', defaultStyles, instanceStyles);

  return (
    <TouchableOpacity
      testID={tID(`tile-button-${id}`)}
      onPress={onPress}
      disabled={!onPress}
      style={[styles.tileColors, styles.tileSize, styles.tileSpacing]}
    >
      <View testID={tID(`tile-view-${id}`)}>
        <Text numberOfLines={2} style={styles.label}>
          {title}
        </Text>
      </View>
      {children}
    </TouchableOpacity>
  );
};

export const spaceBetweenTiles = 16;
export const tileWidth =
  Math.floor(Dimensions.get('window').width - spaceBetweenTiles * 3) / 2;

const defaultStyles = (theme: Theme) => {
  const tileSize: ViewStyle = {
    height: 130,
    width: tileWidth,
  };

  const tileSpacing: ViewStyle = {
    margin: theme.spacing.extraSmall,
    padding: theme.spacing.extraSmall,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const tileColors: ViewStyle = {
    shadowColor: theme.colors.outline,
    shadowRadius: 3,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 1 },
    backgroundColor: theme.colors.surface,
  };

  const label: TextStyle = {
    color: theme.colors.onBackground,
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      ios: 'System',
      default: 'sans-serif-medium',
    }),

    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
    fontSize: 14,
  };

  return { tileSize, tileSpacing, tileColors, label };
};

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<'Tile', typeof defaultStyles> {}
}

export type TileStyles = NamedStylesProp<typeof defaultStyles>;

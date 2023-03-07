import React, { useCallback } from 'react';
import { ScrollView, ViewStyle, View } from 'react-native';
import { AppTile } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from 'src/screens';
import { useStyles } from '../../hooks';
import { spacing } from '../BrandConfigProvider/theme/base';

export interface TilesListProps {
  tiles?: AppTile[];
  children?: React.ReactNode;
  styles?: TilesListStyles;
  tileStyles?: TileStyles;
  onAppTilePress?: () => void;
}

export const TileList = ({
  tiles,
  children,
  styles: instanceStyles,
  tileStyles,
  onAppTilePress,
}: TilesListProps) => {
  const { styles } = useStyles('TilesList', defaultStyles, instanceStyles);
  const { navigate } = useNavigation<HomeScreenNavigation>();

  const onAppTilePressDefault = useCallback(
    (appTile: AppTile) => () => {
      navigate('tiles/AppTile', { appTile });
    },
    [navigate],
  );

  return (
    <ScrollView testID={tID('tiles-list')} style={styles.scrollView}>
      <View style={styles.view}>
        {tiles?.map((appTile) => (
          <Tile
            key={appTile.id}
            id={appTile.id}
            title={appTile.title}
            onPress={
              onAppTilePress ? onAppTilePress : onAppTilePressDefault(appTile)
            }
            styles={tileStyles}
          />
        ))}
        {children}
      </View>
    </ScrollView>
  );
};

const defaultStyles = () => {
  const scrollView: ViewStyle = {};
  const view: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.extraSmall,
  };
  return { scrollView, view };
};

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<'TilesList', typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;

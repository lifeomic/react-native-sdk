import React, { useCallback } from 'react';
import { ScrollView, Image } from 'react-native';
import { AppTile } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from '../../screens/HomeScreen';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { spacing } from '../BrandConfigProvider/theme/base';
import { createStyles } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';

export interface TilesListProps {
  TrackTile?: JSX.Element;
  tiles?: AppTile[];
  children?: React.ReactNode;
  styles?: TilesListStyles;
  tileStyles?: TileStyles;
  onAppTilePress?: (tile: any) => () => void;
}
const appTileIcon = (uri?: string) =>
  function AppTileIcon() {
    if (uri) {
      if (uri.endsWith('svg')) {
        return <SvgUri uri={uri} />;
      } else {
        return <Image source={{ uri }} />;
      }
    }
    return null;
  };

export const TilesList = ({
  TrackTile,
  tiles,
  children,
  styles: instanceStyles,
  onAppTilePress,
}: TilesListProps) => {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { navigate } = useNavigation<HomeScreenNavigation>();
  const { appTileScreens } = useDeveloperConfig();

  const onAppTilePressDefault = useCallback(
    (appTile: AppTile) => () => {
      if (getCustomAppTileComponent(appTileScreens, appTile)) {
        navigate('tiles/CustomAppTile', { appTile });
      } else {
        navigate('tiles/AppTile', { appTile });
      }
    },
    [navigate, appTileScreens],
  );

  return (
    <ScrollView testID={tID('tiles-list')} style={styles.scrollView}>
      {TrackTile && TrackTile}
      {tiles?.map((appTile) => (
        <Tile
          id={appTile.id}
          key={appTile.id}
          title={appTile.title}
          onPress={
            onAppTilePress
              ? onAppTilePress(appTile)
              : onAppTilePressDefault(appTile)
          }
          Icon={appTileIcon(appTile.icon)}
        />
      ))}
      {children}
    </ScrollView>
  );
};

const defaultStyles = createStyles('TilesList', () => ({
  scrollView: {
    flexDirection: 'column',
    marginBottom: spacing.extraLarge,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;
